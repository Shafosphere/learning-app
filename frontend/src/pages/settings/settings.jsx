import "./settings.css";
import React, { useContext, useState, useEffect } from 'react';
import { SettingsContext } from "./properties";

export default function Settings() {
  const { procent, setProcent, dailyGoal, setDailyGoal } = useContext(SettingsContext);
  const [newDailyGoal, setNewDailyGoal] = useState(dailyGoal);
  const [lastResetDate, setLastResetDate] = useState(() => {
    const savedDate = localStorage.getItem("lastResetDate");
    return savedDate !== null ? JSON.parse(savedDate) : new Date().toISOString().slice(0, 10);
  });

  function handleDailyGoalChange(e){
    setNewDailyGoal(e.target.value);
  };

  function saveSettings(){
    setDailyGoal(newDailyGoal);
    setProcent(20);
  }

  function calculatePercent(){
    //tu trzeba jakos zliczać % zrobionych słówk w ciągu dnia
  }

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== lastResetDate) {
      setProcent(0); // Resetujemy procent nauczenia
      setLastResetDate(today); // Ustawiamy nową datę resetu
    }
  }, [lastResetDate]);

  useEffect(() => {
    localStorage.setItem('lastResetDate', JSON.stringify(lastResetDate));
  }, [lastResetDate]);

  return (
    <>
      <div className="container-settings">
        <div className="window-settings">
          <div className="switches">

            <div className="switch-container">
              <span className="switch-text">Sounds</span>
              <label class="switch">
                <input type="checkbox" />
                <span class="slider round"></span>
              </label>
            </div>


            <div className="switch-container">
              <span className="switch-text">B2</span>
              <label class="switch">
                <input type="checkbox" />
                <span class="slider round"></span>
              </label>
              <span className="switch-text">C1</span>
              <label class="switch">
                <input type="checkbox" />
                <span class="slider round"></span>
              </label>
            </div>

          </div>
          <div className="inputs">
          <input type="number" value={newDailyGoal} onChange={handleDailyGoalChange} />
          </div>
          <button className="button" onClick={saveSettings}>Save</button>
        </div>
      </div>
    </>
  );
}
