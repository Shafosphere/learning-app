// useBoxesDB.js
import { useState, useEffect } from "react";

export default function useBoxesDB(lvl) {
  const [boxes, setBoxes] = useState({
    boxOne: [],
    boxTwo: [],
    boxThree: [],
    boxFour: [],
    boxFive: [],
  });

  const [autoSave, setAutoSave] = useState(false);

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
    if (!autoSave) return;

    const request = indexedDB.open("SavedBoxes", 1);
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (db.objectStoreNames.contains(`boxes${lvl}`)) {
        const transaction = db.transaction([`boxes${lvl}`], "readwrite");
        const store = transaction.objectStore(`boxes${lvl}`);

        const clearRequest = store.clear();
        clearRequest.onsuccess = () => {
          const addRequests = [];

          Object.keys(boxes).forEach((boxName) => {
            boxes[boxName].forEach((item) => {
              const itemWithBox = { ...item, boxName };
              const addRequest = new Promise((resolve, reject) => {
                const req = store.add(itemWithBox);
                req.onsuccess = () => resolve();
                req.onerror = () =>
                  reject(`Błąd zapisu do boxa: ${boxName}`);
              });
              addRequests.push(addRequest);
            });
          });

          Promise.all(addRequests)
            .then(() => {
              setAutoSave(false);
              console.log("Zapisano postęp w IndexedDB");
            })
            .catch((err) => {
              console.error("Wystąpił błąd przy zapisie: ", err);
              setAutoSave(false);
            });
        };

        clearRequest.onerror = () => {
          console.error("Błąd czyszczenia store boxes");
        };
      }
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
    };
  }, [autoSave, boxes, lvl]);

  return { boxes, setBoxes, autoSave, setAutoSave };
}
