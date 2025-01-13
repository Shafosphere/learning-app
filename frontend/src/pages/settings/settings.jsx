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
    spellChecking,
    setSpellChecking,
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

  async function clearEverything() {
    try {
      localStorage.clear();
      const deleteIndexedDB = () => {
        const dbs = indexedDB.databases
          ? indexedDB.databases()
          : Promise.resolve([]);

        dbs.then((databases) => {
          databases.forEach((db) => {
            indexedDB.deleteDatabase(db.name);
            console.log(`Usunięto bazę danych: ${db.name}`);
          });
        });
      };

      deleteIndexedDB();

      window.location.reload();
    } catch (error) {
      console.error("An error occurred while clearing everything: ", error);
    }
  }

  return (
    <div className="container-settings1">
      {/* <div>
        <div className="bookmarks-sett">
          <div onClick={() => setBookMark(1)}>1</div>
          <div onClick={() => setBookMark(2)}>2</div>
        </div> */}

      <div className="window-settings">

        <div className="bookmarks-sett">
          <div onClick={() => setBookMark(1)}>1</div>
          <div onClick={() => setBookMark(2)}>2</div>
        </div>

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
              spellChecking={spellChecking}
              setSpellChecking={setSpellChecking}
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
                  </span>
                ),
                language: <FormattedMessage id="changeLanguage" />,
                diacritical: (
                  <p>
                    ignoruje znaki diakrytyczne w polskim
                  </p>
                ),
                spellChecking: (
                  <p>
                    bedziesz mógł pomylić sie o 1 literke
                  </p>
                ),
              };

              return contentMap[activeSpan] || null;
            })()}
          </div>
        </div>
      </div>
      {/* </div> */}
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}
