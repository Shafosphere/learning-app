import React, { createContext, useState, useEffect } from "react";
import api from "../../utils/api"; // Importuj api do wykonywania zapytań do serwera
import { getAllWords, getStatistics } from "../../utils/indexedDB";
import usePersistedState from "../../components/settings/usePersistedState";


export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  
  const [procent, setProcent] = usePersistedState("procent", 0);
  const [totalPercent, setTotalPercent] = usePersistedState("totalPercent", 0);
  const [dailyGoal, setDailyGoal] = usePersistedState("dailyGoal", 20);
  const [lastID, setLastID] = usePersistedState("lastID", 0);
  const [isSoundEnabled, setIsSoundEnabled] = usePersistedState("sound", "true");
  const [language, setLanguage] = usePersistedState("language", "en");
  const [level, setLevel] = usePersistedState("level", "B2");
  const [isLoggedIn, setIsLoggedIn] = usePersistedState("isLoggedIn", false);
  const [user, setUser] = usePersistedState("user", null);
  const [diacritical, setDiacritical] = usePersistedState("diacritical", true);

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
    localStorage.setItem("lastResetDate", JSON.stringify(lastResetDate));
  }, [lastResetDate]);

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
        diacritical,
        setDiacritical,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};