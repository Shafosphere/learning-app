import React, { createContext, useState, useEffect } from "react";
import api from "../../utils/api"; // Importuj api do wykonywania zapytań do serwera
import { getAllWords } from "../../utils/indexedDB";
import usePersistedState from "../../hooks/localstorage/usePersistedState";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [procentC1, setProcentC1] = usePersistedState("ProcentC1MainGame", 0);
  const [procentB2, setProcentB2] = usePersistedState("ProcentB2MainGame", 0);
  const [logostatus, setlogo] = usePersistedState("logostatus", false);
  const [skinstatus, setskin] = usePersistedState("skinstatus", false);

  const [totalPercentC1, setTotalPercentC1] = usePersistedState(
    "totalPercentC1MainGame",
    0
  );
  const [totalPercentB2, setTotalPercentB2] = usePersistedState(
    "totalPercentB2MainGame",
    0
  );

  const [dailyGoal, setDailyGoal] = usePersistedState("dailyGoal", 20);
  const [lastID, setLastID] = usePersistedState("lastID", 0);
  const [isSoundEnabled, setIsSoundEnabled] = usePersistedState(
    "sound",
    "true"
  );
  const [language, setLanguage] = usePersistedState("language", "en");
  const [level, setLevel] = usePersistedState("level", "B2");
  const [isLoggedIn, setIsLoggedIn] = usePersistedState("isLoggedIn", false);
  const [user, setUser] = usePersistedState("user", null);
  const [diacritical, setDiacritical] = usePersistedState("diacritical", true);
  const [spellChecking, setSpellChecking] = usePersistedState(
    "spellChecking",
    false
  );

  const [lastResetDate, setLastResetDate] = useState(() => {
    const savedDate = localStorage.getItem("lastResetDate");
    return savedDate !== null
      ? JSON.parse(savedDate)
      : new Date().toISOString().slice(0, 10);
  });

  const [themeMode, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme !== null ? savedTheme : "light";
  });

  const resetDateIfNeeded = () => {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== lastResetDate) {
      setProcentB2(0);
      setProcentC1(0);
      setLastResetDate(today);
      const wordIds = JSON.parse(localStorage.getItem("wordIds")) || [];
      setLastID(wordIds[wordIds.length - 1] || 0);
    }
  };

  const toggleTheme = () => {
    const newTheme = themeMode === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleLevel = () => {
    const newLevel = level === "C1" ? "B2" : "C1";
    localStorage.setItem("level", newLevel);
    setLevel(newLevel);
    console.log("obecny level: " + newLevel);
  };

  const toggleSound = () => {
    const soundState = isSoundEnabled === "true" ? "false" : "true";
    setIsSoundEnabled(soundState);
    localStorage.setItem("sound", soundState);
  };

  const checkAuthStatus = async () => {
    try {
      const response = await api.get("/auth/user");
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
    document.body.className = themeMode === "dark" ? "dark" : "";
  }, [themeMode]);

  useEffect(() => {
    resetDateIfNeeded();
  }, [lastResetDate]);

  useEffect(() => {
    localStorage.setItem("lastResetDate", JSON.stringify(lastResetDate));
  }, [lastResetDate]);

  const calculatePercent = async (lvl) => {
    const wordIds = await getAllWords(lvl);
    let startIndex = wordIds.findIndex((word) => word.id === lastID);

    if (lastID === 0 || startIndex !== -1) {
      const newArray = lastID === 0 ? wordIds : wordIds.slice(startIndex + 1);
      const percentComplete = (newArray.length * 100) / dailyGoal;
      const roundedPercentComplete = parseFloat(percentComplete.toFixed(2));
      if (lvl === "B2") {
        setProcentB2(roundedPercentComplete);
      } else if (lvl === "C1") {
        setProcentC1(roundedPercentComplete);
      }
    } else {
      console.log("Element not found");
    }
  };

  const calculateTotalPercent = async (lvl) => {
    // 1. Pobranie ID wyuczonych słówek (z IndexedDB lub innej bazy lokalnej)
    const wordIds = await getAllWords(lvl);

    let percent = 0;
    let numberOfWords = 0;

    try {
      // 2. Pobranie informacji z backendu
      const response = await api.get("/word/patch-info");

      // 3. Wybór właściwej wartości z obiektu response
      if (lvl === "B2") {
        numberOfWords = response.data.numberWordsB2;
      } else if (lvl === "C1") {
        numberOfWords = response.data.numberWordsC1;
      }

      // 4. Obliczenie procentu
      if (numberOfWords > 0) {
        percent = (wordIds.length / numberOfWords) * 100;
      }
    } catch (error) {
      console.log(error);
      return;
    }

    // 5. Zaokrąglenie do dwóch miejsc po przecinku
    const roundedPercentComplete = parseFloat(percent.toFixed(2));

    // 6. Ustawienie stanu w zależności od poziomu
    if (lvl === "B2") {
      setTotalPercentB2(roundedPercentComplete);
    } else if (lvl === "C1") {
      setTotalPercentC1(roundedPercentComplete);
    }
  };

  const toggleLogo = () => {
    const newLogo = logostatus === false ? true : false;
    setlogo(newLogo);
  };

  const toggleSkin = () => {
    const newSkin = skinstatus === false ? true : false;
    setskin(newSkin);
  };

  return (
    <SettingsContext.Provider
      value={{
        dailyGoal,
        setDailyGoal,
        lastID,
        setLastID,
        calculatePercent,
        calculateTotalPercent,
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
        spellChecking,
        setSpellChecking,
        totalPercentB2,
        totalPercentC1,
        procentC1,
        procentB2,
        logostatus,
        setlogo,
        toggleLogo,
        skinstatus,
        setskin,
        toggleSkin,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
