import "./settings.css";
import React, { useContext, useState, useEffect } from "react";
import { SettingsContext } from "./properties";
import { PopupContext } from "../../components/popup/popupcontext";
import ConfirmWindow from "../../components/confirm/confirm";
import { FormattedMessage } from "react-intl";
import FirstBookMark from "../../components/settings/firstbookmark";
import SecondBookMark from "../../components/settings/secondbookmark";

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
    diacritical,
    setDiacritical,
  } = useContext(SettingsContext);

  //popup
  const { setPopup } = useContext(PopupContext);

  const [bookMark, setBookMark] = useState(1);

  const [newDailyGoal, setNewDailyGoal] = useState(dailyGoal);

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
    setPopup({
      message: "Settings saved",
      emotion: "positive",
    });
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
              <SecondBookMark
                diacritical={diacritical}
                setDiacritical={setDiacritical}
                setSpan={setSpan}
              />
            )}
          </div>

          {/* descriptions */}
          <div className="settings-right">
            <div className="explanation">
              {(() => {
                const contentMap = {
                  Sounds: <FormattedMessage id="turnOffSoundEffects" />,
                  C1: <FormattedMessage id="addsC1WordPool" />,
                  DailyGoal: <FormattedMessage id="changeDailyProgress" />,
                  darkmode: <FormattedMessage id="mode" />,
                  resetsbuttons: (
                    <span>
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
                  ),
                  language: <FormattedMessage id="changeLanguage" />,
                  diacritical: (
                    <p>
                      przy sprawdzaniu wyników traktuje:
                      <br /> "ą" jako "a"
                      <br /> "ę" jako "e"
                      <br /> "ź" jako "z"
                      <br /> itd
                    </p>
                  ),
                };

                return contentMap[activeSpan] || null;
              })()}
            </div>
          </div>
        </div>
      </div>
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}
