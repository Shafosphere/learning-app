import React, { createContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [procent, setProcent] = useState(() => {
    const savedProcent = localStorage.getItem("procent");
    return savedProcent !== null ? JSON.parse(savedProcent) : 0;
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    const savedDailyGoal = localStorage.getItem("dailyGoal");
    return savedDailyGoal !== null ? JSON.parse(savedDailyGoal) : 20;
  });

  const [lastID, setLastID] = useState(() => {
    const savedLastID = localStorage.getItem("lastID");
    return savedLastID !== null ? JSON.parse(savedLastID) : null;
  });

  useEffect(() => {
    localStorage.setItem('lastID', JSON.stringify(lastID));
  }, [lastID]);

  useEffect(() => {
    localStorage.setItem('procent', JSON.stringify(procent));
  }, [procent]);

  useEffect(() => {
    localStorage.setItem('dailyGoal', JSON.stringify(dailyGoal));
  }, [dailyGoal]);

  const calculatePercent = () => {
    const wordIds = JSON.parse(localStorage.getItem("wordIds")) || [];
    const startIndex = wordIds.indexOf(lastID);

    if (startIndex !== -1) {
      const newArray = wordIds.filter((_, index) => index > startIndex);
      console.log(newArray.length);
      const percentComplete = (((newArray.length)*100)/dailyGoal)
      const roundedPercentComplete = percentComplete.toFixed(2);
      setProcent(roundedPercentComplete);
    } else {
      console.log("Element not found");
    }
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
