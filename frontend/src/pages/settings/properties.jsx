import React, { createContext, useState, useEffect } from "react";
import api from "../../utils/api"; // Importuj api do wykonywania zapytań do serwera
import { getAllWords, getStatistics } from "../../utils/indexedDB";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [procent, setProcent] = useState(() => {
    const savedProcent = localStorage.getItem("procent");
    return savedProcent !== null ? JSON.parse(savedProcent) : 0;
  });

  const [totalPercent, setTotalPercent] = useState(() => {
    const savedTotalPercent = localStorage.getItem("totalPercent");
    return savedTotalPercent !== null ? JSON.parse(savedTotalPercent) : 0;
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    const savedDailyGoal = localStorage.getItem("dailyGoal");
    return savedDailyGoal !== null ? JSON.parse(savedDailyGoal) : 20;
  });

  const [lastID, setLastID] = useState(() => {
    const savedLastID = localStorage.getItem("lastID");
    return savedLastID !== null ? JSON.parse(savedLastID) : 0;
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const savedSound = localStorage.getItem("sound");
    return savedSound !== null ? JSON.parse(savedSound) : 'true';
  });

  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage !== null ? JSON.parse(savedLanguage) : 'en';
  });

  const [lastResetDate, setLastResetDate] = useState(() => {
    const savedDate = localStorage.getItem("lastResetDate");
    return savedDate !== null
      ? JSON.parse(savedDate)
      : new Date().toISOString().slice(0, 10);
  });

  const [themeMode, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme !== null ? savedTheme : 'light';
  });

  const [level, setLevel] = useState(() => {
    const savedLevel = localStorage.getItem("level");
    return savedLevel !== null ? JSON.parse(savedLevel) : 'B2';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedLoginStatus = localStorage.getItem("isLoggedIn");
    return savedLoginStatus !== null ? JSON.parse(savedLoginStatus) : false;
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser !== null ? JSON.parse(savedUser) : null;
  });

  const resetDateIfNeeded = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== lastResetDate) {
      setProcent(0);
      setLastResetDate(today);
      const wordIds = JSON.parse(localStorage.getItem("wordIds")) || [];
      setLastID(wordIds[wordIds.length - 1] || 0);
    }
  };

  const toggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const toggleLevel = () => {
    const newLevel = level === 'C1' ? 'B2' : 'C1';
    localStorage.setItem('level', newLevel);
    setLevel(newLevel);
    console.log("obecny level: " + newLevel); 
  };

  const toggleSound = () => {
    const soundState = isSoundEnabled === 'true' ? 'false' : 'true';
    setIsSoundEnabled(soundState);
    localStorage.setItem('sound', soundState);
  }

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth/user');
      if (response.status === 200 && response.data.loggedIn) {
        setIsLoggedIn(true);
        setUser(response.data.user);
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    } catch (error) {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    document.body.className = themeMode === 'dark' ? 'dark' : '';
  }, [themeMode]);

  useEffect(() => {
    resetDateIfNeeded();
  }, [lastResetDate]);

  useEffect(() => {
    localStorage.setItem("language", JSON.stringify(language));
  }, [language]);

  useEffect(() => {
    localStorage.setItem("sound", JSON.stringify(isSoundEnabled));
  }, [isSoundEnabled]);

  useEffect(() => {
    localStorage.setItem("level", JSON.stringify(level));
  }, [level]);

  useEffect(() => {
    localStorage.setItem("lastResetDate", JSON.stringify(lastResetDate));
  }, [lastResetDate]);

  useEffect(() => {
    localStorage.setItem("lastID", JSON.stringify(lastID));
  }, [lastID]);

  useEffect(() => {
    localStorage.setItem("procent", JSON.stringify(procent));
  }, [procent]);

  useEffect(() => {
    localStorage.setItem("totalPercent", JSON.stringify(totalPercent));
  }, [totalPercent]);

  useEffect(() => {
    localStorage.setItem("dailyGoal", JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  useEffect(() => {
    localStorage.setItem("isLoggedIn", JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    calculateTotalPercent();
  }, [level]);

  const calculatePercent = async () => {
    console.log('calculatePercent');
    const wordIds = await getAllWords();
    console.log('wordIds:', wordIds);
    console.log('lastID:', lastID);

    let startIndex = wordIds.findIndex(word => word.id === lastID);
    console.log('startIndex:', startIndex);

    if (lastID === 0 || startIndex !== -1) {
      const newArray = lastID === 0 ? wordIds : wordIds.slice(startIndex + 1);
      console.log('newArray:', newArray);

      const percentComplete = (newArray.length * 100) / dailyGoal;
      console.log('percentComplete:', percentComplete);

      const roundedPercentComplete = parseFloat(percentComplete.toFixed(2));
      console.log('roundedPercentComplete:', roundedPercentComplete);

      setProcent(roundedPercentComplete);
    } else {
      console.log("Element not found");
    }
  };
  
  const calculateTotalPercent = async () => {
    const wordIds = await getAllWords();
    let userWords = await getStatistics();
    
    // Znajdź statystyki dla B2, jeśli istnieją, w przeciwnym razie ustaw domyślną wartość
    const b2Stat = userWords.find(stat => stat.category === "B2") || { count: 0 };
  
    let maxWordId;
    let b2;
    let percentComplete;
  
    try {
      const response = await api.get("/word/information");
      maxWordId = response.data.maxWordId;
      b2 = response.data.b2;
    } catch (error) {
      console.log(error);
      return;
    }
  
    if (level === "B2") {
      percentComplete = (b2Stat.count * 100) / b2;
      console.log(`B2: ${b2}, liczba słów: ${b2Stat.count}`);
    } else if (level === "C1") {
      percentComplete = (wordIds.length * 100) / maxWordId;
      console.log(`C1: ${maxWordId}, liczba słów: ${wordIds.length}`);
    } else {
      throw new Error("Nieznany poziom trudności");
    }
  
    const roundedPercentComplete = parseFloat(percentComplete.toFixed(2));
    setTotalPercent(roundedPercentComplete);
  };
  

  return (
    <SettingsContext.Provider
      value={{
        procent,
        setProcent,
        dailyGoal,
        setDailyGoal,
        lastID,
        setLastID,
        calculatePercent,
        calculateTotalPercent,
        totalPercent,
        setTotalPercent,
        lastResetDate,
        setLastResetDate,
        resetDateIfNeeded,
        themeMode,
        toggleTheme,
        isSoundEnabled,
        toggleSound,
        language,
        setLanguage,
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        level,
        setLevel,
        toggleLevel,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
