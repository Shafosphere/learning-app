import React from "react";
import { FormattedMessage } from "react-intl";

import polandFlag from "../../data/poland-small.png";
import usaFlag from "../../data/united-states-small.png";

export default function FirstBookMark({
  setSpan,
  toggleSound,
  isSoundEnabled,
  toggleTheme,
  themeMode,
  language,
  setLanguage,
  toggleLogo,
  logostatus,
  toggleSkin,
  skinstatus,
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

      {/* Toggle Super Logo */}
      <div
        className="switch-container onMouse"
        onMouseEnter={() => setSpan("toggleLogo")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.superLogo"
            defaultMessage="Enable super logo"
          />
        </span>
        <label className="switch">
          <input
            onClick={() => toggleLogo()}
            defaultChecked={logostatus === true}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Toggle Super Skin */}
      <div
        className="switch-container onMouse"
        onMouseEnter={() => setSpan("toggleSkin")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.superSkin"
            defaultMessage="Enable super box skin"
          />
        </span>
        <label className="switch">
          <input
            onClick={() => toggleSkin()}
            defaultChecked={skinstatus === true}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>
    </>
  );
}
