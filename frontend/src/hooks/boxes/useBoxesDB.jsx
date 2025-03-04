// useBoxesDB.js
import { useState, useEffect, useContext, useCallback } from "react";
import { SettingsContext } from "../../pages/settings/properties";
import api from "../../utils/api";

export default function useBoxesDB(
  lvl,
  patchNumberB2,
  patchNumberC1,
  setB2Patch,
  setC1Patch
) {
  const { isLoggedIn } = useContext(SettingsContext);
  const [boxes, setBoxes] = useState({
    boxOne: [],
    boxTwo: [],
    boxThree: [],
    boxFour: [],
    boxFive: [],
  });
  const [autoSave, setAutoSave] = useState(false);
  const deviceId = localStorage.getItem("deviceId");

  const updateLocalPatchNumber = useCallback(
    (newValue) => {
      if (lvl === "B2") setB2Patch(newValue);
      if (lvl === "C1") setC1Patch(newValue);
    },
    [lvl, setB2Patch, setC1Patch]
  );



  const updateIndexedDBFromServer = useCallback(
    async (serverData) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("SavedBoxes", 2);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          initializeDB(db, lvl);
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(`boxes${lvl}`)) {
            reject(new Error(`Object store boxes${lvl} not found`));
            return;
          }
          const transaction = db.transaction([`boxes${lvl}`], "readwrite");
          const store = transaction.objectStore(`boxes${lvl}`);

          store.clear().onsuccess = () => {
            serverData.forEach((item) => {
              store.add(item);
            });
            resolve();
          };
        };

        request.onerror = reject;
      });
    },
    [lvl]
  );


  const serwerAutoload = useCallback(async () => {
    try {
      const response = await api.post("/user/auto-load", {
        level: lvl,
        deviceId: deviceId,
      });
      const serverData = response.data;

      if (serverData.last_saved) {
        localStorage.setItem(
          `serverTimestamp_${lvl}`,
          new Date(serverData.last_saved).getTime()
        );
      }

      if (serverData.patchNumber) {
        localStorage.setItem(`patchNumber${lvl}-home`, serverData.patchNumber);
      }

      await updateIndexedDBFromServer(response.data.words);
      console.log("Dane z serwera wczytane i zapisane w IndexedDB");
      return response;
    } catch (error) {
      console.error("Błąd autoload:", error);
      return null;
    }
  }, [lvl, deviceId, updateIndexedDBFromServer]);

  const resolveSaveConflict = async () => {
    const guestTimestamp = localStorage.getItem(`guestTimestamp_${lvl}`);
    if (!guestTimestamp) return;

    try {
      const response = await api.post("/user/auto-load", {
        level: lvl,
        deviceId: deviceId,
      });
      const serverData = response.data;

      if (!serverData.last_saved) {
        await serwerAutosave();
        return;
      }

      const serverTimestamp = new Date(serverData.last_saved).getTime();
      const guestTimeNumber = parseInt(guestTimestamp);

      if (guestTimeNumber > serverTimestamp) {
        const confirmOverride = window.confirm(
          `Masz niezapisany progres jako gość (${new Date(
            guestTimeNumber
          ).toLocaleString()}). ` +
            `Na koncie istnieje zapis z ${new Date(
              serverTimestamp
            ).toLocaleString()}.\n\n` +
            `Kontynuować lokalny progres? (OK - tak, Anuluj - wczytaj serwerowy)`
        );

        if (confirmOverride) {
          await serwerAutosave();
        } else {
          await updateIndexedDBFromServer(serverData.words);
          if (serverData.patchNumber) {
            const currentLvl = lvl.toLowerCase();
            const serverPatch = serverData[`patch_number_${currentLvl}`];
            updateLocalPatchNumber(serverPatch);
          }
        }
      }

      localStorage.removeItem(`guestTimestamp_${lvl}`);
    } catch (error) {
      console.error("Błąd konfliktu:", error);
    }
  };

  // 1. Użycie useCallback dla funkcji serwerowych
  const serwerAutosave = useCallback(async () => {
    // Generowanie dynamicznych danych z boxów
    const currentPatch = lvl === "B2" ? patchNumberB2 : patchNumberC1;
    const words = Object.entries(boxes).flatMap(([boxName, items]) =>
      items.map(({ id }) => ({ id, boxName }))
    );

    const data = {
      level: lvl,
      deviceId: deviceId,
      words,
      patchNumber: currentPatch,
    };
    console.log(data);
    try {
      const response = await api.post("/user/auto-save", data); // Usunięto zbędne {data}
      console.log("autozapis wykonany", response.data);
    } catch (error) {
      console.error("Błąd autozapisu:", error);
    }
  }, [boxes, lvl, deviceId, patchNumberB2, patchNumberC1]);

  const initializeDB = (db, lvl) => {
    if (!db.objectStoreNames.contains(`boxes${lvl}`)) {
      db.createObjectStore(`boxes${lvl}`, { keyPath: "id" });
    }
  };


  // 3. Nowa funkcja do aktualizacji IndexedDB z danymi z serwera


  // 4. Poprawiony efekt ładowania danych
  useEffect(() => {
    const loadData = async () => {
      // Najpierw sprawdź czy jest zalogowany
      if (isLoggedIn) {
        // 1. Rozwiąż konflikt i wczytaj dane z serwera
        await resolveSaveConflict();
        const response = await serwerAutoload();

        // 2. Aktualizuj patch number z serwera
        if (response?.data?.patchNumber) {
          updateLocalPatchNumber(response.data.patchNumber);
        }
      }

      // Następnie zawsze ładuj z IndexedDB
      const dbData = await new Promise((resolve, reject) => {
        const request = indexedDB.open("SavedBoxes", 2);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          // Utwórz wszystkie możliwe object stores
          ["B2", "C1"].forEach((level) => {
            if (!db.objectStoreNames.contains(`boxes${level}`)) {
              db.createObjectStore(`boxes${level}`, { keyPath: "id" });
            }
          });
        };

        request.onsuccess = (event) => {
          const db = event.target.result;

          // Sprawdź czy istnieje store dla aktualnego poziomu
          if (!db.objectStoreNames.contains(`boxes${lvl}`)) {
            const version = db.version + 1;
            db.close();

            // Wymuś aktualizację wersji bazy
            const upgradeRequest = indexedDB.open("SavedBoxes", version);
            upgradeRequest.onupgradeneeded = (e) => {
              const newDB = e.target.result;
              newDB.createObjectStore(`boxes${lvl}`, { keyPath: "id" });
            };

            upgradeRequest.onsuccess = (e) => {
              const newDB = e.target.result;
              const transaction = newDB.transaction(
                [`boxes${lvl}`],
                "readonly"
              );
              const store = transaction.objectStore(`boxes${lvl}`);
              store.getAll().onsuccess = (e) => resolve(e.target.result);
            };
          } else {
            const transaction = db.transaction([`boxes${lvl}`], "readonly");
            const store = transaction.objectStore(`boxes${lvl}`);
            store.getAll().onsuccess = (e) => resolve(e.target.result);
          }
        };

        request.onerror = reject;
      });

      // Aktualizacja stanu
      const newBoxesState = {
        boxOne: [],
        boxTwo: [],
        boxThree: [],
        boxFour: [],
        boxFive: [],
      };
      dbData.forEach((item) => {
        const { boxName, ...rest } = item;
        if (newBoxesState[boxName]) {
          newBoxesState[boxName].push(rest);
        }
      });
      setBoxes(newBoxesState);

      if (!isLoggedIn) {
        const localPatch = localStorage.getItem(`patchNumber${lvl}-home`);
        if (localPatch) {
          if (lvl === `B2`) {
            setB2Patch(Number(localPatch));
          } else {
            setC1Patch(Number(localPatch));
          }
        }
      }
    };

    loadData();
  }, [lvl, isLoggedIn, serwerAutoload, setB2Patch, setC1Patch]);

  // 6. Poprawiony efekt zapisu
  useEffect(() => {
    const saveData = async () => {
      if (!autoSave) return;

      // Dla gościa: zapisz timestamp
      if (!isLoggedIn) {
        localStorage.setItem(`guestTimestamp_${lvl}`, Date.now());
      }

      try {
        if (isLoggedIn) await serwerAutosave();

        await new Promise((resolve, reject) => {
          const request = indexedDB.open("SavedBoxes", 1);

          request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction([`boxes${lvl}`], "readwrite");
            const store = transaction.objectStore(`boxes${lvl}`);

            store.clear().onsuccess = async () => {
              const promises = [];
              Object.entries(boxes).forEach(([boxName, items]) => {
                items.forEach((item) => {
                  promises.push(store.put({ ...item, boxName }));
                });
              });

              await Promise.all(promises);
              resolve();
            };
          };

          request.onerror = reject;
        });

        setAutoSave(false);
      } catch (error) {
        /* ... */
      }
    };

    saveData();
  }, [autoSave, boxes, lvl, isLoggedIn, serwerAutosave]);

  return { boxes, setBoxes, autoSave, setAutoSave };
}
