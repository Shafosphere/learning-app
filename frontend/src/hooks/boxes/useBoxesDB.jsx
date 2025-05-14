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

  const serverAutoload = useCallback(async () => {
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
        localStorage.setItem(
          `patchNumber${lvl}-maingame`,
          serverData.patchNumber
        );
      }

      await updateIndexedDBFromServer(response.data.words);
      console.log("Data from server loaded and saved to IndexedDB");
      return response;
    } catch (error) {
      console.error("Autoload error:", error);
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
        await serverAutosave();
        return;
      }

      const serverTimestamp = new Date(serverData.last_saved).getTime();
      const guestTimeNumber = parseInt(guestTimestamp, 10);

      if (guestTimeNumber > serverTimestamp) {
        // Ask user to choose based on timestamps
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
      console.error("Conflict resolution error:", error);
    }
  };

  const serverAutosave = useCallback(async () => {
    // Prepare dynamic data from boxes
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
      const response = await api.post("/user/auto-save", data);
      console.log("Autosave completed", response.data);
    } catch (error) {
      console.error("Autosave error:", error);
    }
  }, [boxes, lvl, deviceId, patchNumberB2, patchNumberC1]);

  const initializeDB = (db, lvl) => {
    if (!db.objectStoreNames.contains(`boxes${lvl}`)) {
      db.createObjectStore(`boxes${lvl}`, { keyPath: "id" });
    }
  };

  // Effect to load data initially
  useEffect(() => {
    const loadData = async () => {
      if (isLoggedIn) {
        // Resolve conflict then autoload from server
        await resolveSaveConflict();
        const response = await serverAutoload();

        if (response?.data?.patchNumber) {
          updateLocalPatchNumber(response.data.patchNumber);
        }
      }

      // Always load from IndexedDB
      const dbData = await new Promise((resolve, reject) => {
        const request = indexedDB.open("SavedBoxes", 2);

        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          ["B2", "C1"].forEach((level) => {
            if (!db.objectStoreNames.contains(`boxes${level}`)) {
              db.createObjectStore(`boxes${level}`, { keyPath: "id" });
            }
          });
        };

        request.onsuccess = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(`boxes${lvl}`)) {
            const version = db.version + 1;
            db.close();

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

      // Update state with loaded data
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
        const localPatch = localStorage.getItem(`patchNumber${lvl}-maingame`);
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
  }, [lvl, isLoggedIn, serverAutoload, setB2Patch, setC1Patch]);

  // Effect to save data when autoSave flag changes
  useEffect(() => {
    const saveData = async () => {
      if (!autoSave) return;

      try {
        if (isLoggedIn) {
          await serverAutosave();
        } else {
          localStorage.setItem(`guestTimestamp_${lvl}`, Date.now());
        }

        // Always save to IndexedDB
        await new Promise((resolve, reject) => {
          const request = indexedDB.open("SavedBoxes", 2);

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
        console.error("Save error:", error);
      }
    };

    saveData();
  }, [autoSave, boxes, lvl, isLoggedIn, serverAutosave]);

  return { boxes, setBoxes, autoSave, setAutoSave };
}
