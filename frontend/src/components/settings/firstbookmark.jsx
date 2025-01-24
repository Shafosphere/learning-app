import React from "react";
import { FormattedMessage } from "react-intl";

import polandFlag from "../../data/poland-small.png";
import usaFlag from "../../data/united-states-small.png";

import MyButton from "../button/button";

export default function FirstBookMark({
  setSpan,
  toggleSound,
  isSoundEnabled,
  toggleTheme,
  themeMode,
  language,
  setLanguage,
  showConfirm,
  clearEverything,
  handleDailyGoalChange,
  newDailyGoal,
  saveSettings,
}) {
  return (
    <>
      <div className="switches">
        {/* Sounds */}
        <div
          className="switch-container onMouse"
          onMouseEnter={() => setSpan("Sounds")}
        >
          <span className="switch-text">
            <FormattedMessage id="sounds" defaultMessage="Sounds" />
          </span>
          <label className="switch">
            <input
              onClick={toggleSound}
              defaultChecked={isSoundEnabled === "true"}
              type="checkbox"
            />
            <span className="slider round"></span>
          </label>
        </div>

        {/* Dark Mode */}
        <div
          className="switch-container onMouse"
          onMouseEnter={() => setSpan("darkmode")}
        >
          <span className="switch-text">
            <FormattedMessage id="darkMode" defaultMessage="Dark Mode" />
          </span>
          <label className="switch">
            <input
              type="checkbox"
              checked={themeMode === "dark"}
              onChange={() => toggleTheme()}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* Language */}
      <div
        className="container-language onMouse"
        onMouseEnter={() => setSpan("language")}
      >
        <span className="switch-text">
          <FormattedMessage id="language" defaultMessage="Language" />
        </span>
        <div className="flags">
          <img
            alt="polish"
            src={polandFlag}
            className={language === "pl" ? "activated_lang" : ""}
            onClick={() => setLanguage("pl")}
          />
          <img
            alt="english"
            src={usaFlag}
            className={language === "en" ? "activated_lang" : ""}
            onClick={() => setLanguage("en")}
          />
        </div>
      </div>

      {/* Reset */}
      <div
        className="container-resets onMouse"
        onMouseEnter={() => setSpan("resetsbuttons")}
      >
        <span className="switch-text">
          <FormattedMessage id="resetButtons" defaultMessage="Reset Buttons" />
        </span>
        <div className="resets-buttons">
          <MyButton
            message={<FormattedMessage id="resetAll" defaultMessage="All" />}
            color="red"
            onClick={() =>
              showConfirm(
                <FormattedMessage
                  id="areYouSureResetEverything"
                  defaultMessage="Are you sure you want to reset everything?"
                />,
                () => clearEverything()
              )
            }
          />
        </div>
      </div>

      {/* Daily Goal */}
      <div
        className="dailyGoal onMouse"
        onMouseEnter={() => setSpan("DailyGoal")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="dailyProgress"
            defaultMessage="Daily Progress"
          />
        </span>
        <input
          type="number"
          value={newDailyGoal}
          onChange={handleDailyGoalChange}
        />
      </div>

      {/* Save Button */}
      <div className="button-container-save">
        <button
          style={{ "--buttonColor": "var(--secondary)" }}
          className="button"
          onClick={saveSettings}
        >
          <FormattedMessage id="saveSettings" defaultMessage="Save Settings" />
        </button>
      </div>
    </>
  );
}
