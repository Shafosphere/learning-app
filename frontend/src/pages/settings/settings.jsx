import "./settings.css";
import React, { useContext, useState, useEffect } from "react";
import { SettingsContext } from "./properties";
import Popup from "../../components/popup/popup";

export default function Settings() {
  const { dailyGoal, setDailyGoal, resetDateIfNeeded } =
    useContext(SettingsContext);

  const [newDailyGoal, setNewDailyGoal] = useState(dailyGoal);

  // popup
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");

  // span management
  const [activeSpan, setSpan] = useState("");

  function handleDailyGoalChange(e) {
    setNewDailyGoal(e.target.value);
  }

  function saveSettings() {
    setDailyGoal(newDailyGoal);
    setPopupEmotion("positive");
    setPopupMessage("Settings saved");
  }

  useEffect(() => {
    resetDateIfNeeded();
  }, [resetDateIfNeeded]);

  return (
    <div className="container-settings">
      <div className="window-settings">
        <div className="settings-left">
          <div className="switches">
            <div
              className="switch-container onMouse"
              onMouseEnter={() => setSpan("Sounds")}
            >
              <span className="switch-text">Sounds</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>

            <div
              className="switch-container onMouse"
              onMouseEnter={() => setSpan("C1")}
            >
              <span className="switch-text">C1</span>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
          <div
            className="dailyGoal onMouse"
            onMouseEnter={() => setSpan("DailyGoal")}
          >
            <span className="switch-text">daily progress</span>
            <input
              type="number"
              value={newDailyGoal}
              onChange={handleDailyGoalChange}
            />
          </div>
          <div className="button-container-sett">
            <button
              style={{ "--buttonColor": "var(--tertiary)" }}
              className="button"
              onClick={saveSettings}
            >
              Save
            </button>
          </div>
        </div>

        <div className="settings-right">
          <div className="explanation">
            <span
              className={`${activeSpan === "Sounds" ? "" : "hide-span-sett"}`}
            >
              Turn off sound effects.
            </span>
            <span className={`${activeSpan === "C1" ? "" : "hide-span-sett"}`}>
              Adds a C1 word pool (another 2,000 words) and increases the total
              progression.
            </span>
            <span
              className={`${
                activeSpan === "DailyGoal" ? "" : "hide-span-sett"
              }`}
            >
              Change daily progress.
            </span>
          </div>
        </div>
      </div>
      {popupMessage && (
        <Popup
          message={popupMessage}
          emotion={popupEmotion}
          onClose={() => setPopupMessage("")}
        />
      )}
    </div>
  );
}
