// useBoxesDB.js
import { useState, useEffect, useContext, useCallback } from "react";
import { SettingsContext } from "../../pages/settings/properties";
import api from "../../utils/api";

export default function useBoxesDB(lvl) {
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

  // 1. Użycie useCallback dla funkcji serwerowych
  const serwerAutosave = useCallback(async () => {
    // Generowanie dynamicznych danych z boxów
    const words = Object.entries(boxes).flatMap(([boxName, items]) =>
      items.map(({ id }) => ({ id, boxName }))
    );

    const data = {
      level: lvl,
      deviceId: deviceId,
      words,
    };
    console.log(data);
    try {
      const response = await api.post("/user/auto-save", data); // Usunięto zbędne {data}
      console.log("autozapis wykonany", response.data);
    } catch (error) {
      console.error("Błąd autozapisu:", error);
    }
  }, [boxes, lvl, deviceId]);

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
      // 2. Po wczytaniu z serwera - aktualizacja IndexedDB
      console.log(response);
      console.log(response.data.words);
      await updateIndexedDBFromServer(response.data.words);
      console.log("Dane z serwera wczytane i zapisane w IndexedDB");
    } catch (error) {
      /* ... */
    }
  }, [lvl]);

  // 3. Nowa funkcja do aktualizacji IndexedDB z danymi z serwera
  const updateIndexedDBFromServer = useCallback(
    async (serverData) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("SavedBoxes", 1);

        request.onsuccess = (event) => {
          const db = event.target.result;
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
        }
      }

      localStorage.removeItem(`guestTimestamp_${lvl}`);
    } catch (error) {
      console.error("Błąd konfliktu:", error);
    }
  };

  // 4. Poprawiony efekt ładowania danych
  useEffect(() => {
    const loadData = async () => {
      // Najpierw sprawdź czy jest zalogowany
      if (isLoggedIn) {
        await resolveSaveConflict(); // Najpierw rozwiąż konflikt
        await serwerAutoload(); // Dopiero potem wczytaj
      }

      // Następnie zawsze ładuj z IndexedDB
      const dbData = await new Promise((resolve, reject) => {
        const request = indexedDB.open("SavedBoxes", 1);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains("boxesB2")) {
            db.createObjectStore("boxesB2", { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains("boxesC1")) {
            db.createObjectStore("boxesC1", { keyPath: "id" });
          }
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction([`boxes${lvl}`], "readonly");
          const store = transaction.objectStore(`boxes${lvl}`);
          const request = store.getAll();

          request.onsuccess = () => resolve(request.result);
          request.onerror = reject;
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
    };

    loadData();
  }, [lvl, isLoggedIn, serwerAutoload]); // 5. Stabilne zależności

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
