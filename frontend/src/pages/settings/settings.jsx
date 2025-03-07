import "./settings.css";
import React, { useContext, useState, useEffect } from "react";
import { SettingsContext } from "./properties";
import { PopupContext } from "../../components/popup/popupcontext";
import ConfirmWindow from "../../components/confirm/confirm";
import { FormattedMessage, useIntl } from "react-intl";
import FirstBookMark from "../../components/settings/firstbookmark";
import SecondBookMark from "../../components/settings/secondbookmark";
import api from "../../utils/api";
import ThirdBookMark from "../../components/settings/thirdbookmark";

export default function Settings() {
  const intl = useIntl();
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
    toggleLevel,
    diacritical,
    setDiacritical,
    spellChecking,
    setSpellChecking,
    calculatePercent,
    toggleLogo,
    logostatus,
    toggleSkin,
    skinstatus,
    isLoggedIn,
  } = useContext(SettingsContext);

  // popup
  const { setPopup } = useContext(PopupContext);
  const [activePage, setPage] = useState("1");
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
      message: intl.formatMessage({
        id: "settings.saved",
        defaultMessage: "Settings saved",
      }),
      emotion: "positive",
    });
  }

  function showConfirm(text, callback) {
    setConfirmMessage(text);
    setConfirmCallback(() => callback);
  }

  useEffect(() => {
    ["B2", "C1"].forEach((level) => calculatePercent(level));
  }, [dailyGoal, calculatePercent]);

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
            console.log(
              intl.formatMessage({
                id: "settings.dbDeleted",
                defaultMessage: "Deleted database",
              }) + `: ${db.name}`
            );
          });
        });
      };
      deleteIndexedDB();
      window.location.reload();
    } catch (error) {
      console.error(
        intl.formatMessage({
          id: "settings.clearError",
          defaultMessage: "An error occurred while clearing everything:",
        }),
        error
      );
    }
  }

  // Funkcja resetująca progres w Vocabulary (localStorage)
  function resetProgressVoca(lvl) {
    const keysToRemove = [
      `carouselItems-${lvl}`,
      `lastDataItemId-${lvl}`,
      `currentPatch-${lvl}`,
      `patchLength-${lvl}`,
      `dataIndexForBottomDiv-${lvl}`,
      `end-${lvl}`,
      `summary-${lvl}`,
      `wordsAnsweredCount-${lvl}`,
    ];
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }

  // Funkcja resetująca progres w Flashcards (localStorage + IndexedDB)
  async function resetProgressFlashcards(level) {
    // Reset numeru paczki
    localStorage.setItem(`patchNumber${level}-home`, 1);
    // Czyścimy store w IndexedDB

    const request = indexedDB.open("SavedBoxes", 2);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const storeName = `boxes${level}`;
      if (db.objectStoreNames.contains(storeName)) {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          console.log(`IndexedDB store ${storeName} cleared successfully.`);
        };
        clearRequest.onerror = (e) => {
          console.error(`Error clearing store ${storeName}:`, e);
        };
      } else {
        console.warn(`Store ${storeName} not found in IndexedDB.`);
      }
    };
    request.onerror = (e) => {
      console.error("Error opening IndexedDB:", e);
    };

    if (isLoggedIn) {
      try {
        await api.post("/user/auto-delete", { level });
        console.log("Progres zresetowany na serwerze");
      } catch (error) {
        console.error("Błąd resetowania na serwerze:", error);
        throw error;
      }
    }
  }

  return (
    <div className="container-settings1">
      <div className="window-settings">
        <div className="pageNumbers-settings">
          <div
            onClick={() => setPage("1")}
            className={
              activePage === "1" ? "tab-settings-active" : "tab-settings"
            }
          >
            1
          </div>
          <div
            onClick={() => setPage("2")}
            className={
              activePage === "2" ? "tab-settings-active" : "tab-settings"
            }
          >
            2
          </div>
          <div
            onClick={() => setPage("3")}
            className={
              activePage === "3" ? "tab-settings-active" : "tab-settings"
            }
          >
            3
          </div>
        </div>

        <div className="settings-left">
          {activePage === "1" && (
            <FirstBookMark
              activeSpan={activeSpan}
              setSpan={setSpan}
              toggleSound={toggleSound}
              isSoundEnabled={isSoundEnabled}
              toggleTheme={toggleTheme}
              themeMode={themeMode}
              toggleLevel={toggleLevel}
              language={language}
              setLanguage={setLanguage}
              showConfirm={showConfirm}
              clearEverything={clearEverything}
              toggleLogo={toggleLogo}
              logostatus={logostatus}
              toggleSkin={toggleSkin}
              skinstatus={skinstatus}
            />
          )}
          {activePage === "2" && (
            <SecondBookMark
              setSpan={setSpan}
              diacritical={diacritical}
              setDiacritical={setDiacritical}
              spellChecking={spellChecking}
              setSpellChecking={setSpellChecking}
              handleDailyGoalChange={handleDailyGoalChange}
              newDailyGoal={newDailyGoal}
              saveSettings={saveSettings}
            />
          )}
          {activePage === "3" && (
            <ThirdBookMark
              setSpan={setSpan}
              showConfirm={showConfirm}
              clearEverything={clearEverything}
              resetProgressVoca={resetProgressVoca}
              resetProgressFlashcards={resetProgressFlashcards}
            />
          )}
        </div>

        <div className="settings-right">
          <div className="explanation">
            {(() => {
              const contentMap = {
                Sounds: (
                  <FormattedMessage
                    id="turnOffSoundEffects"
                    defaultMessage="Disable or enable sound effects"
                  />
                ),
                C1: (
                  <FormattedMessage
                    id="addsC1WordPool"
                    defaultMessage="Adds C1 level words to your practice pool"
                  />
                ),
                DailyGoal: (
                  <FormattedMessage
                    id="changeDailyProgress"
                    defaultMessage="Change your daily progress goal"
                  />
                ),
                darkmode: (
                  <FormattedMessage
                    id="mode"
                    defaultMessage="Switch between dark and light mode"
                  />
                ),
                resetsbuttons: (
                  <span>
                    <p>
                      <FormattedMessage
                        id="resetButtons"
                        defaultMessage="Reset buttons"
                      />
                    </p>
                  </span>
                ),
                language: (
                  <FormattedMessage
                    id="changeLanguage"
                    defaultMessage="Select application language"
                  />
                ),
                diacritical: (
                  <FormattedMessage
                    id="explanation.diacritical"
                    defaultMessage="Ignores diacritical marks in Polish words."
                  />
                ),
                spellChecking: (
                  <FormattedMessage
                    id="explanation.spellChecking"
                    defaultMessage="You can be off by one letter."
                  />
                ),
                resetsvocabulary: (
                  <FormattedMessage
                    id="explanation.resetsvocabulary"
                    defaultMessage="This will reset the progress at the specified level in the vocabulary tab."
                  />
                ),
                resetsflashcard: (
                  <FormattedMessage
                    id="explanation.resetsflashcard"
                    defaultMessage="This will reset the progress at the specified level in the vocabulary tab."
                  />
                ),
                toggleLogo: (
                  <FormattedMessage
                    id="explanation.toggleLogo"
                    defaultMessage="This will set the super logo instead of the default one."
                  />
                ),
                toggleSkin: (
                  <FormattedMessage
                    id="explanation.toggleSkin"
                    defaultMessage="This will change the box skins in the main game."
                  />
                ),
              };
              return contentMap[activeSpan] || null;
            })()}
          </div>
        </div>
      </div>
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}
