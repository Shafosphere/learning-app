import React, { createContext, useState, useEffect } from "react";
import api from "../../utils/api"; // Importuj api do wykonywania zapytań do serwera

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
    return savedLastID !== null ? JSON.parse(savedLastID) : null;
  });

  const [isSoundEnabled, setIsSoundEnabled] = useState(() => {
    const savedSound = localStorage.getItem("sound");
    return savedSound !== null ? JSON.parse(savedSound) : true;
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

  const toggleSound = () => {
    const soundState = isSoundEnabled === 'true' ? 'false' : 'true';
    setIsSoundEnabled(soundState);
    localStorage.setItem('sound', soundState);
  }

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/check-auth');
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

  const calculatePercent = () => {
    console.log('calculatePercent');
    const wordIds = JSON.parse(localStorage.getItem("wordIds")) || [];
    console.log('wordIds:', wordIds);
    console.log('lastID:', lastID);
  
    let startIndex = wordIds.indexOf(lastID);
    console.log('startIndex:', startIndex);
  
    // Jeśli lastID jest równy 0 lub lastID znajduje się w wordIds
    if (lastID === 0 || startIndex !== -1) {
      // Jeżeli lastID jest równy 0, używamy całej tablicy wordIds
      const newArray = lastID === 0 ? wordIds : wordIds.slice(startIndex + 1);
      console.log('newArray:', newArray);
  
      // Obliczanie procentu ukończenia
      const percentComplete = (newArray.length * 100) / dailyGoal;
      console.log('percentComplete:', percentComplete);
  
      // Zaokrąglanie procentu
      const roundedPercentComplete = parseFloat(percentComplete.toFixed(2));
      console.log('roundedPercentComplete:', roundedPercentComplete);
  
      // Ustawienie nowej wartości procentu
      setProcent(roundedPercentComplete);
    } else {
      console.log("Element not found");
    }
  };

  const calculateTotalPercent = () => {
    const wordIds = JSON.parse(localStorage.getItem("wordIds")) || [];
    const percentComplete = (wordIds.length * 100) / 2974;
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
