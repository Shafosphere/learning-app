// useBoxesDB.js
import { useState, useEffect, useContext, useCallback } from "react";
import { SettingsContext } from "../../pages/settings/properties";
import api from "../../utils/api";

export default function useBoxesDB(
  lvl,
  patchNumberB2,
  patchNumberC1,
  setB2Patch,
  setC1Patch,
  showConfirm
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

  // Update the local patch number based on level
  const updateLocalPatchNumber = useCallback(
    (newValue) => {
      if (lvl === "B2") setB2Patch(newValue);
      if (lvl === "C1") setC1Patch(newValue);
    },
    [lvl, setB2Patch, setC1Patch]
  );

  // Overwrite IndexedDB store with server-side words data
  const updateIndexedDBFromServer = useCallback(
    async (wordsData) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("SavedBoxes", 2);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          initializeDB(db, lvl);
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          const storeName = `boxes${lvl}`;
          if (!db.objectStoreNames.contains(storeName)) {
            reject(new Error(`Object store ${storeName} not found`));
            return;
          }
          const tx = db.transaction([storeName], "readwrite");
          const store = tx.objectStore(storeName);

          store.clear().onsuccess = () => {
            wordsData.forEach((item) => store.add(item));
            resolve();
          };
        };

        request.onerror = reject;
      });
    },
    [lvl]
  );

  // 1. Use useCallback for server-side load
  const serverAutoload = useCallback(async () => {
    try {
      const response = await api.post("/user/auto-load", {
        level: lvl,
        deviceId,
      });
      const serverData = response.data;

      if (serverData.last_saved) {
        localStorage.setItem(
          `serverTimestamp_${lvl}`,
          new Date(serverData.last_saved).getTime()
        );
      }

      if (serverData.patchNumber) {
        localStorage.setItem(
          `patchNumber${lvl}-maingame`,
          serverData.patchNumber
        );
      }

      await updateIndexedDBFromServer(serverData.words);
      console.log("Server data loaded and saved to IndexedDB");
      return response;
    } catch (error) {
      console.error("Error during auto-load:", error);
      return null;
    }
  }, [lvl, deviceId, updateIndexedDBFromServer]);

  // 2. Resolve conflicts between guest and server data
  const resolveSaveConflict = async () => {
    const guestTimestamp = localStorage.getItem(`guestTimestamp_${lvl}`);
    if (!guestTimestamp) return;

    try {
      const response = await api.post("/user/auto-load", {
        level: lvl,
        deviceId,
      });
      const serverData = response.data;

      if (!serverData.last_saved) {
        await serverAutosave();
        return;
      }

      const serverTimestamp = new Date(serverData.last_saved).getTime();
      const guestTimeNumber = parseInt(guestTimestamp, 10);

      if (guestTimeNumber > serverTimestamp) {
        const userConfirmed = await showConfirm(
          guestTimeNumber,
          serverTimestamp
        );

        if (userConfirmed) {
          await serverAutosave();
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
      console.error("Error resolving conflict:", error);
    }
  };

  // 3. Automatically send data to server or save guest timestamp
  const serverAutosave = useCallback(async () => {
    const currentPatch = lvl === "B2" ? patchNumberB2 : patchNumberC1;
    const words = Object.entries(boxes).flatMap(([boxName, items]) =>
      items.map(({ id }) => ({ id, boxName }))
    );

    const payload = {
      level: lvl,
      deviceId,
      words,
      patchNumber: currentPatch,
    };
    console.log("Auto-save payload:", payload);
    try {
      const response = await api.post("/user/auto-save", payload);
      console.log("Auto-save completed:", response.data);
    } catch (error) {
      console.error("Error during auto-save:", error);
    }
  }, [boxes, lvl, deviceId, patchNumberB2, patchNumberC1]);

  // Initialize IndexedDB store for the given level
  const initializeDB = (db, level) => {
    const storeName = `boxes${level}`;
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: "id" });
    }
  };

  // 4. Updated data loading effect
  useEffect(() => {
    const loadData = async () => {
      if (isLoggedIn) {
        await resolveSaveConflict();
        const response = await serverAutoload();
        if (response?.data?.patchNumber) {
          updateLocalPatchNumber(response.data.patchNumber);
        }
      }

      // Then always load from IndexedDB
      const dbData = await new Promise((resolve, reject) => {
        const request = indexedDB.open("SavedBoxes", 2);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          ["B2", "C1"].forEach((level) => initializeDB(db, level));
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          const storeName = `boxes${lvl}`;
          if (!db.objectStoreNames.contains(storeName)) {
            const version = db.version + 1;
            db.close();
            const upgradeRequest = indexedDB.open("SavedBoxes", version);
            upgradeRequest.onupgradeneeded = (e) =>
              initializeDB(e.target.result, lvl);
            upgradeRequest.onsuccess = (e) =>
              (e.target.result
                .transaction([storeName], "readonly")
                .objectStore(storeName)
                .getAll().onsuccess = (e) => resolve(e.target.result));
          } else {
            db
              .transaction([storeName], "readonly")
              .objectStore(storeName)
              .getAll().onsuccess = (e) => resolve(e.target.result);
          }
        };

        request.onerror = reject;
      });

      // Update state with IndexedDB data
      const newBoxesState = {
        boxOne: [],
        boxTwo: [],
        boxThree: [],
        boxFour: [],
        boxFive: [],
      };
      dbData.forEach((item) => {
        const { boxName, ...rest } = item;
        if (newBoxesState[boxName]) newBoxesState[boxName].push(rest);
      });
      setBoxes(newBoxesState);

      if (!isLoggedIn) {
        const localPatch = localStorage.getItem(`patchNumber${lvl}-maingame`);
        if (localPatch) {
          const parsed = Number(localPatch);
          if (lvl === "B2") setB2Patch(parsed);
          else setC1Patch(parsed);
        }
      }
    };

    loadData();
  }, [
    lvl,
    isLoggedIn,
    resolveSaveConflict,
    serverAutoload,
    updateLocalPatchNumber,
  ]);

  // 6. Updated save effect
  useEffect(() => {
    const saveData = async () => {
      if (!autoSave) return;

      try {
        if (isLoggedIn) {
          await serverAutosave();
        } else {
          localStorage.setItem(`guestTimestamp_${lvl}`, Date.now());
        }

        // Always write to IndexedDB
        await new Promise((resolve, reject) => {
          const request = indexedDB.open("SavedBoxes", 2);
          request.onsuccess = (event) => {
            const db = event.target.result;
            const tx = db.transaction([`boxes${lvl}`], "readwrite");
            const store = tx.objectStore(`boxes${lvl}`);
            store.clear().onsuccess = async () => {
              for (const [boxName, items] of Object.entries(boxes)) {
                for (const item of items) await store.put({ ...item, boxName });
              }
              resolve();
            };
          };
          request.onerror = reject;
        });

        setAutoSave(false);
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    saveData();
  }, [autoSave, boxes, lvl, isLoggedIn, serverAutosave]);

  return { boxes, setBoxes, autoSave, setAutoSave };
}
