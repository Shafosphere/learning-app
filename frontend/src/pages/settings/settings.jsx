import "./settings.css";
import React, { useContext, useState, useEffect } from "react";
import { SettingsContext } from "./properties";
import Popup from "../../components/popup/popup";
import ConfirmWindow from "../../components/confirm/confirm";
import polandFlag from "../../data/poland.png";
import usaFlag from "../../data/united-states.png";
import { FormattedMessage } from "react-intl";

export default function Settings() {
  const {
    dailyGoal,
    setDailyGoal,
    resetDateIfNeeded,
    themeMode,
    toggleTheme,
    isSoundEnabled,
    toggleSound,
    language,
    setLanguage,
    level,
    toggleLevel,
  } = useContext(SettingsContext);

  const [bookMark, setBookMark] = useState(1);

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

  function clearBoxes() {
    return new Promise((resolve, reject) => {
      let db;
      const request = indexedDB.open("MyTestDatabase", 2);

      request.onupgradeneeded = (event) => {
        console.log("onupgradeneeded event fired");
        db = event.target.result;
        console.log("Upgrading database to version", db.version);
        if (!db.objectStoreNames.contains("boxes")) {
          db.createObjectStore("boxes", { keyPath: "id" });
          console.log('Object store "boxes" created.');
        } else {
          console.log('Object store "boxes" already exists.');
        }
      };

      request.onsuccess = (event) => {
        console.log("onsuccess event fired");
        db = event.target.result;
        console.log("Database opened successfully");
        if (db.objectStoreNames.contains("boxes")) {
          const transaction = db.transaction(["boxes"], "readwrite");
          const store = transaction.objectStore("boxes");

          const clearRequest = store.clear();

          clearRequest.onsuccess = () => {
            console.log('Object store "boxes" has been cleared.');
            resolve(); // Zakończ Promise po pomyślnym wyczyszczeniu
          };

          clearRequest.onerror = () => {
            console.error('Error clearing the object store "boxes".');
            reject('Error clearing the object store "boxes".'); // Zakończ Promise z błędem
          };
        } else {
          console.error("Object store 'boxes' does not exist.");
          reject("Object store 'boxes' does not exist."); // Zakończ Promise z błędem
        }
      };

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
        reject("IndexedDB error: " + event.target.error); // Zakończ Promise z błędem
      };
    });
  }

  function clearProgress() {
    let wordIds = [];
    localStorage.setItem("wordIds", JSON.stringify(wordIds));
    localStorage.setItem("totalPercent", JSON.stringify(0));
    localStorage.setItem("lastID", JSON.stringify(null));
    localStorage.setItem("dailyGoal", JSON.stringify("20"));
  }

  async function clearEverything() {
    try {
      clearProgress();
      await clearBoxes(); // Poczekaj na zakończenie clearBoxes
      localStorage.setItem("theme", "light");
      localStorage.setItem("sound", "true"); // Zapisz jako string
      window.location.reload(); // Odśwież stronę po zakończeniu wszystkich operacji
    } catch (error) {
      console.error("An error occurred while clearing everything: ", error);
    }
  }

  return (
    <div className="container-settings">
      <div>
        <div className="bookmarks-sett">
          <div onClick={() => setBookMark(1)}>1</div>
          <div onClick={() => setBookMark(2)}>2</div>
        </div>

        <div className="window-settings">
          <div className="settings-left">
            {bookMark === 1 ? (
              <FirstBookMark
                activeSpan={activeSpan}
                setSpan={setSpan}
                toggleSound={toggleSound}
                isSoundEnabled={isSoundEnabled}
                toggleTheme={toggleTheme}
                themeMode={themeMode}
                toggleLevel={toggleLevel}
                level={level}
                language={language}
                setLanguage={setLanguage}
                showConfirm={showConfirm}
                clearBoxes={clearBoxes}
                clearProgress={clearProgress}
                clearEverything={clearEverything}
                handleDailyGoalChange={handleDailyGoalChange}
                newDailyGoal={newDailyGoal}
                saveSettings={saveSettings}
              />
            ) : (
              <SecondBookMark />
            )}
          </div>

          {/* descriptions */}
          <div className="settings-right">
            <div className="explanation">
              <span
                className={`${activeSpan === "Sounds" ? "" : "hide-span-sett"}`}
              >
                <FormattedMessage id="turnOffSoundEffects" />
              </span>

              <span
                className={`${activeSpan === "C1" ? "" : "hide-span-sett"}`}
              >
                <FormattedMessage id="addsC1WordPool" />
              </span>

              <span
                className={`${
                  activeSpan === "DailyGoal" ? "" : "hide-span-sett"
                }`}
              >
                <FormattedMessage id="changeDailyProgress" />
              </span>

              <span
                className={`${
                  activeSpan === "darkmode" ? "" : "hide-span-sett"
                }`}
              >
                <FormattedMessage id="mode" />
              </span>

              <span
                className={`${
                  activeSpan === "resetsbuttons" ? "" : "hide-span-sett"
                }`}
              >
                <p>
                  <FormattedMessage id="resetButtons" />
                </p>
                <ul className="reset-list">
                  <li>
                    - <FormattedMessage id="resetBoxesDescription" />
                  </li>
                  <li>
                    - <FormattedMessage id="resetProgressDescription" />
                  </li>
                  <li>
                    - <FormattedMessage id="resetEverythingDescription" />
                  </li>
                </ul>
              </span>

              <span
                className={`${
                  activeSpan === "language" ? "" : "hide-span-sett"
                }`}
              >
                <FormattedMessage id="changeLanguage" />
              </span>
            </div>
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
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}

function FirstBookMark({
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
  clearBoxes,
  clearProgress,
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
          <button
            style={{ "--buttonColor": "var(--tertiary)" }}
            className="button"
            onClick={() =>
              showConfirm(<FormattedMessage id="areYouSureResetBoxes" />, () =>
                clearBoxes()
              )
            }
          >
            <FormattedMessage id="resetBoxes" />
          </button>
          <button
            style={{ "--buttonColor": "var(--tertiary)" }}
            className="button"
            onClick={() =>
              showConfirm(
                <FormattedMessage id="areYouSureResetProgress" />,
                () => clearProgress()
              )
            }
          >
            <FormattedMessage id="resetProgress" />
          </button>
          <button
            style={{ "--buttonColor": "var(--tertiary)" }}
            className="button"
            onClick={() =>
              showConfirm(
                <FormattedMessage id="areYouSureResetEverything" />,
                () => clearEverything()
              )
            }
          >
            <FormattedMessage id="resetEverything" />
          </button>
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

function SecondBookMark() {
  return (
    <div className="switches">
      <div
        className="switch-container onMouse"
        // onMouseEnter={() => setSpan("Sounds")}
      >
        <span className="switch-text">znaki specjalne</span>
        <label className="switch">
          <input
            // onClick={toggleSound}
            // defaultChecked={isSoundEnabled === "true"}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div
        className="switch-container onMouse"
        // onMouseEnter={() => setSpan("Sounds")}
      >
        <span className="switch-text">vocabulary import</span>
        <label className="switch">
          <input
            // onClick={toggleSound}
            // defaultChecked={isSoundEnabled === "true"}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
}
