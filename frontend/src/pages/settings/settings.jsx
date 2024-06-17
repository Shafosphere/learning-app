import "./settings.css";
import React, { useContext, useState, useEffect } from "react";
import { SettingsContext } from "./properties";
import Popup from "../../components/popup/popup";
import ConfirmWindow from "../../components/confirm/confirm";
import polandFlag from "../../data/poland.png";
import usaFlag from "../../data/united-states.png";

export default function Settings() {
  const {
    dailyGoal,
    setDailyGoal,
    resetDateIfNeeded,
    themeMode,
    toggleTheme,
    isSoundEnabled,
    toggleSound,
  } = useContext(SettingsContext);

  const [newDailyGoal, setNewDailyGoal] = useState(dailyGoal);

  // popup
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");

  // confirm
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

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

  function showConfirm(text, callback) {
    setConfirmMessage(text);
    setConfirmCallback(() => callback);
  }

  useEffect(() => {
    resetDateIfNeeded();
  }, [resetDateIfNeeded]);

  const handleConfirmClose = (result) => {
    if (result && confirmCallback) {
      confirmCallback();
    }
    setConfirmMessage("");
    setConfirmCallback(null);
  };

  return (
    <div className="container-settings">
      <div className="window-settings">
        <div className="settings-left">
          {/* switches */}
          <div className="switches">
            <div
              className="switch-container onMouse"
              onMouseEnter={() => setSpan("Sounds")}
            >
              <span className="switch-text">Sounds</span>
              <label className="switch">
              <input
                  onClick={toggleSound}
                  defaultChecked={isSoundEnabled === "true"}
                  type="checkbox"
                />
                <span className="slider round"></span>
              </label>
            </div>

            <div
              className="switch-container onMouse"
              onMouseEnter={() => setSpan("darkmode")}
            >
              <span className="switch-text">Dark Mode</span>
              <label className="switch">
                <input
                  onClick={toggleTheme}
                  defaultChecked={themeMode === "dark"}
                  type="checkbox"
                />
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

          {/* language */}
          <div
            className="container-language onMouse"
            onMouseEnter={() => setSpan("language")}
          >
            <span className="switch-text">language</span>
            <div className="flags">
              <img alt="box" src={polandFlag} />
              <img alt="box" src={usaFlag} />
            </div>
          </div>

          {/* reset */}
          <div
            className="container-resets onMouse"
            onMouseEnter={() => setSpan("resetsbuttons")}
          >
            <span className="switch-text">reset buttons</span>
            <div className="resets-buttons">
              <button
                style={{ "--buttonColor": "var(--tertiary)" }}
                className="button"
                onClick={() => showConfirm('Are you sure you want to reset the boxes?', () => console.log('Yes'))}
              >
                boxes
              </button>
              <button
                style={{ "--buttonColor": "var(--tertiary)" }}
                className="button"
                onClick={() => showConfirm('Are you sure you want to reset the progress?', () => console.log('Yes'))}
              >
                progress
              </button>
              <button
                style={{ "--buttonColor": "var(--tertiary)" }}
                className="button"
                onClick={() => showConfirm('Are you sure you want to reset everything?', () => console.log('Yes'))}
              >
                everything
              </button>
            </div>
          </div>

          {/* dailygoal */}
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

          {/* save button */}
          <div className="button-container-save">
            <button
              style={{ "--buttonColor": "var(--secondary)" }}
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

            <span
              className={`${activeSpan === "darkmode" ? "" : "hide-span-sett"}`}
            >
              Turn on dark mode.
            </span>

            <span
              className={`${
                activeSpan === "resetsbuttons" ? "" : "hide-span-sett"
              }`}
            >
              <p>Reset buttons:</p>
              <ul className="reset-list">
                <li> - boxes - deletes words from boxes</li>
                <li> - progress - resets progress to zero</li>
                <li>- all - resets everything to the initial state</li>
              </ul>
            </span>

            <span
              className={`${activeSpan === "language" ? "" : "hide-span-sett"}`}
            >
              change the language of the website
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
      {confirmMessage && (
        <ConfirmWindow
          message={confirmMessage}
          onClose={handleConfirmClose} // Zmiana tutaj
        />
      )}
    </div>
  );
}
