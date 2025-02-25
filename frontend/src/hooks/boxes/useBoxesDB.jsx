// useBoxesDB.js
import { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../../pages/settings/properties";
import api from "../../utils/api";

export default function useBoxesDB(lvl) {
  // Ustawienia z kontekstu
  const { isLoggedIn } = useContext(SettingsContext);

  const [boxes, setBoxes] = useState({
    boxOne: [],
    boxTwo: [],
    boxThree: [],
    boxFour: [],
    boxFive: [],
  });

  const [autoSave, setAutoSave] = useState(false);

  // 1. Poprawiona funkcja serwerAutosave
  const serwerAutosave = async () => {
    // Generowanie dynamicznych danych z boxów
    const words = Object.entries(boxes).flatMap(([boxName, items]) =>
      items.map(({ id }) => ({ id, boxName }))
    );

    const data = {
      level: lvl, // Poprawiona składnia - brak niepotrzebnych nawiasów klamrowych
      words,
    };

    try {
      const response = await api.post("/user/auto-save", data); // Usunięto zbędne {data}
      console.log("autozapis wykonany", response.data);
    } catch (error) {
      console.error("Błąd autozapisu:", error);
    }
  };

  // 1. Odczyt z IndexedDB
  useEffect(() => {
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
      if (db.objectStoreNames.contains(`boxes${lvl}`)) {
        const transaction = db.transaction([`boxes${lvl}`], "readonly");
        const store = transaction.objectStore(`boxes${lvl}`);
        const getAllRequest = store.getAll();

        getAllRequest.onsuccess = () => {
          const allData = getAllRequest.result;
          const newBoxesState = {
            boxOne: [],
            boxTwo: [],
            boxThree: [],
            boxFour: [],
            boxFive: [],
          };
          allData.forEach((item) => {
            const { boxName, ...rest } = item;
            if (newBoxesState[boxName]) {
              newBoxesState[boxName].push(rest);
            }
          });
          setBoxes(newBoxesState);
        };
        getAllRequest.onerror = () => {
          console.error("Błąd odczytu z boxes w IndexedDB");
        };
      }
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
    };
  }, [lvl]);

  // 2. Zapis do IndexedDB, wywoływany jeśli autoSave == true
  useEffect(() => {
    const saveData = async () => {
      if (!autoSave) return;
      console.log("Rozpoczęcie autozapisu");

      if (isLoggedIn) {
        console.log("wysyłam na serwer")
        await serwerAutosave();
      }

      // Operacje IndexedDB
      await new Promise((resolve, reject) => {
        const request = indexedDB.open("SavedBoxes", 1);

        request.onsuccess = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(`boxes${lvl}`)) {
            reject(`Brak store boxes${lvl}`);
            return;
          }

          const transaction = db.transaction([`boxes${lvl}`], "readwrite");
          const store = transaction.objectStore(`boxes${lvl}`);

          store.clear().onsuccess = () => {
            const addRequests = [];

            Object.entries(boxes).forEach(([boxName, items]) => {
              items.forEach((item) => {
                const itemWithBox = { ...item, boxName };
                addRequests.push(store.add(itemWithBox));
              });
            });

            Promise.all(
              addRequests.map(
                (req) =>
                  new Promise((res, rej) => {
                    req.onsuccess = res;
                    req.onerror = rej;
                  })
              )
            )
              .then(() => {
                console.log("Zapisano w IndexedDB");
                resolve();
              })
              .catch(reject);
          };
        };

        request.onerror = (event) => {
          reject(event.target.error);
        };
      });

      setAutoSave(false);
      console.log("Cały proces zapisu zakończony");
    };

    // Wywołaj funkcję zapisu
    saveData().catch((error) => {
      console.error("Błąd podczas zapisu:", error);
      setAutoSave(false);
    });
  }, [autoSave, boxes, lvl, isLoggedIn]);

  return { boxes, setBoxes, autoSave, setAutoSave };
}
