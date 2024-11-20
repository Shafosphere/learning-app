import React from "react";
import { FormattedMessage } from "react-intl";
import polandFlag from "../../data/poland.png";
import usaFlag from "../../data/united-states.png";
import MyButton from "../button/button";

export default function FirstBookMark({
  activeSpan,
  setSpan,
  toggleSound,
  isSoundEnabled,
  toggleTheme,
  themeMode,
  toggleLevel,
  level,
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
        <div
          className="switch-container onMouse"
          onMouseEnter={() => setSpan("Sounds")}
        >
          <span className="switch-text">
            <FormattedMessage id="sounds" />
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

        <div
          className="switch-container onMouse"
          onMouseEnter={() => setSpan("darkmode")}
        >
          <span className="switch-text">
            <FormattedMessage id="darkMode" />
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

        <div
          className="switch-container onMouse"
          onMouseEnter={() => setSpan("C1")}
        >
          <span className="switch-text">
            <FormattedMessage id="c1" />
          </span>
          <label className="switch">
            <input
              onChange={() => toggleLevel()}
              type="checkbox"
              checked={level === "C1"}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* language */}
      <div
        className="container-language onMouse"
        onMouseEnter={() => setSpan("language")}
      >
        <span className="switch-text">
          <FormattedMessage id="language" />
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

      {/* reset */}
      <div
        className="container-resets onMouse"
        onMouseEnter={() => setSpan("resetsbuttons")}
      >
        <span className="switch-text">
          <FormattedMessage id="resetButtons" />
        </span>
        <div className="resets-buttons">
          <MyButton
            message="wszystko"
            color="red"
            onClick={() =>
              showConfirm(
                <FormattedMessage id="areYouSureResetEverything" />,
                () => clearEverything()
              )
            }
          />
        </div>
      </div>

      {/* dailygoal */}
      <div
        className="dailyGoal onMouse"
        onMouseEnter={() => setSpan("DailyGoal")}
      >
        <span className="switch-text">
          <FormattedMessage id="dailyProgress" />
        </span>
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
          <FormattedMessage id="saveSettings" />
        </button>
      </div>
    </>
  );
}
