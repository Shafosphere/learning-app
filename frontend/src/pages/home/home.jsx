import "./home.css";
import Flashcard from "../../components/home/card/flashcard";
import EmptyFlashcard from "../../components/home/card/empty-flashcard";
import Boxes from "../../components/home/box/box";
import dingSound from "../../data/ding.wav";
import dongSound from "../../data/dong.wav";
import Progressbar from "../../components/home/bar/bar";
import Confetti from "../../components/voca/confetti";

import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { addWord, getAllWords } from "../../utils/indexedDB";
import { SettingsContext } from "../settings/properties";
import { PopupContext } from "../../components/popup/popupcontext";
import { useIntl } from "react-intl";
import api from "../../utils/api";

import usePersistedState from "../../components/settings/usePersistedState";
import useSpellchecking from "../../components/spellchecking/spellchecking";
import usePageVisit from "../../components/activity/countingentries";

export default function Home() {
  const intl = useIntl();
  const [randomWord, setRandom] = useState(null); //selected word
  const [className, setClass] = useState(""); //class display
  const [showWrongAnswer, setShowWrongAnswer] = useState("not-visible");
  const [activeBox, setActiveBox] = useState("boxOne"); //clicked box
  const timeoutRef = useRef(null);
  const [boxes, setBoxes] = useState({
    //boxes
    boxOne: [],
    boxTwo: [],
    boxThree: [],
    boxFour: [],
    boxFive: [],
  });
  const wordFlashcardRef = useRef(null);
  const idFlashcardRef = useRef(null);

  const checkSpelling = useSpellchecking();

  //Confetti
  const [showConfetti, setShowConfetti] = useState(false);
  const [generateConfetti, setGenerateConfetti] = useState(false);

  //focus management
  const userWordRef = useRef(null);
  const correctWordRef = useRef(null);
  const correctSecondWordRef = useRef(null);

  //sound
  const dingSoundRef = useRef(new Audio(dingSound));
  const dongSoundRef = useRef(new Audio(dongSound));

  //popup
  const { setPopup } = useContext(PopupContext);

  //Paches
  const [patchNumberB2, setB2Patch] = usePersistedState(
    "patchNumberB2-home",
    1
  );
  const [patchNumberC1, setC1Patch] = usePersistedState(
    "patchNumberC1-home",
    1
  );
  const [nextPatchType, setPatchType] = usePersistedState(
    "nextPatchType-home",
    "B2"
  );

  const [totalB2Patches, setTotalB2] = useState(null);
  const [totalC1Patches, setTotalC1] = useState(null);

  //progressBar
  const {
    calculatePercent,
    calculateTotalPercent,
    procent,
    totalPercent,
    isSoundEnabled,
    level,
  } = useContext(SettingsContext);

  //autosave
  const [autoSave, setAutoSave] = useState(false);

  usePageVisit('flashcards');

  function check(userWord, word, id) {
    if (checkAnswer(userWord, word)) {
      setClass("correct");
      clearTimeout(timeoutRef.current);
      if (isSoundEnabled === "true") {
        dingSoundRef.current.play();
      }
      timeoutRef.current = setTimeout(() => {
        setClass("");
        moveWord(id, word, false);
        selectRandomWord(activeBox);
        setAutoSave(true);
      }, 1500);
    } else {
      setClass("notcorrect");
      setShowWrongAnswer("visible");
      correctWordRef.current.focus();
      if (isSoundEnabled === "true") {
        dongSoundRef.current.play();
      }
    }
  }

  const handleSetWordFlash = useCallback((item) => {
    wordFlashcardRef.current = item;
  }, []);

  const handleSetwordId = useCallback((item) => {
    idFlashcardRef.current = item;
  }, []);

  function changeCorrectStatus() {
    setClass("");
    moveWord(idFlashcardRef.current, wordFlashcardRef.current, true);
    selectRandomWord(activeBox);
    setShowWrongAnswer("not-visible");
    setAutoSave(true);
    userWordRef.current.focus();
  }

  function handleSetBox(item) {
    selectRandomWord(item);
    setActiveBox(item);
  }

  async function moveWord(id, chosen_word, moveToFirst = false) {
    const boxOrder = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];
    const currentBoxIndex = boxOrder.indexOf(activeBox);
    let nextBox = boxOrder[currentBoxIndex + 1];

    if (moveToFirst) {
      nextBox = "boxOne";
    }
    if (activeBox === "boxOne" && moveToFirst) {
      return;
    }
    if (activeBox === "boxFive" && !moveToFirst) {
      const newid = randomWord.id;
      const wordIds = await getAllWords();
      if (!wordIds.some((word) => word.id === newid)) {
        await addWord(newid);
        calculatePercent();
        calculateTotalPercent();
        confettiShow();
      }

      setBoxes((prevBoxes) => {
        const updatedBoxFive = prevBoxes[activeBox].filter(
          (obiekt) =>
            obiekt.wordPl.word !== chosen_word &&
            obiekt.wordEng.word !== chosen_word
        );

        if (updatedBoxFive.length === 0) {
          setRandom(null);
        }

        return {
          ...prevBoxes,
          [activeBox]: updatedBoxFive,
        };
      });
    }

    if (moveToFirst || currentBoxIndex < boxOrder.length - 1) {
      const find_word = boxes[activeBox].filter(
        (obiekt) =>
          obiekt.wordPl.word === chosen_word ||
          obiekt.wordEng.word === chosen_word
      );

      setBoxes((prevBoxes) => {
        const updatedCurrentBox = prevBoxes[activeBox].filter(
          (obiekt) =>
            obiekt.wordPl.word !== chosen_word &&
            obiekt.wordEng.word !== chosen_word
        );

        const updatedNextBox = [...prevBoxes[nextBox], ...find_word];

        return {
          ...prevBoxes,
          [activeBox]: updatedCurrentBox,
          [nextBox]: updatedNextBox,
        };
      });
    }
  }

  async function addWords() {
    await getNextPatch();
  }

  async function getNextPatch() {
    try {
      let levelToFetch = nextPatchType;
      let patchNumber = levelToFetch === "B2" ? patchNumberB2 : patchNumberC1;
      let totalPatches =
        levelToFetch === "B2" ? totalB2Patches : totalC1Patches;

      if (patchNumber > totalPatches) {
        // Jeśli patche dla danego poziomu się skończyły
        if (levelToFetch === "B2" && level === "C1") {
          levelToFetch = "C1";
          patchNumber = patchNumberC1;
          totalPatches = totalC1Patches;
        } else {
          // Wszystkie patche wyczerpane
          setPopup({
            message: "Ukończyłeś wszystkie słowa!",
            emotion: "positive",
          });
          return;
        }
      }

      const response = await requestPatch(levelToFetch, patchNumber);

      if (response && response.data && response.data.data) {
        const newWords = response.data.data;

        setBoxes((prevBoxes) => ({
          ...prevBoxes,
          boxOne: [...prevBoxes.boxOne, ...newWords],
        }));

        setAutoSave(true);

        // Aktualizuj numery patchy i typ następnego patcha
        if (levelToFetch === "B2") {
          setB2Patch(patchNumber + 1);
          localStorage.setItem("currentB2Patch-voca", patchNumber + 1);
        } else {
          setC1Patch(patchNumber + 1);
          localStorage.setItem("currentC1Patch-voca", patchNumber + 1);
        }

        // Przełącz typ następnego patcha, jeśli poziom C1 jest włączony
        if (level === "C1") {
          const nextType = nextPatchType === "B2" ? "C1" : "B2";
          setPatchType(nextType);
          localStorage.setItem("nextPatchType-voca", nextType);
        }

        if (activeBox === "boxOne") {
          selectRandomWord("boxOne");
        }
      }
    } catch (error) {
      console.error("Error fetching next patch:", error);
    }
  }

  async function requestPatch(level, patchNumber) {
    try {
      const response = await api.post("/word/patch-data", {
        level: level,
        patchNumber: patchNumber,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching ${level} patch ${patchNumber}:`, error);
      throw error;
    }
  }

  function selectRandomWord(item) {
    setBoxes((prevBoxes) => {
      const boxLength = prevBoxes[item].length;
      let randomIndex = 0;
      if (boxLength > 1) {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * boxLength);
        } while (randomWord && prevBoxes[item][newIndex].id === randomWord.id);
        randomIndex = newIndex;
      }
      const newRandomWord = prevBoxes[item][randomIndex];
      setRandom(newRandomWord);
      return prevBoxes;
    });
  }

  function checkAnswer(userWord, word) {
    if (userWord && word) {
      // Użycie funkcji `checkSpelling` z hooka `useSpellchecking`
      const isCorrect = checkSpelling(userWord, word);
  
      return isCorrect;
    } else {
      console.log("Brak danych do porównania!");
      return false;
    }
  }
  

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function readAndDisplayAllData() {
      let db;
      const request = indexedDB.open("SavedBoxes", 1);

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains("boxes")) {
          db.createObjectStore("boxes", { keyPath: "id" });
        } else {
          console.log('Object store "boxes" already exists.');
        }
      };

      request.onsuccess = (event) => {
        const db = event.target.result;
        if (db.objectStoreNames.contains("boxes")) {
          const transaction = db.transaction(["boxes"], "readonly");
          const store = transaction.objectStore("boxes");
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
            console.error("Error reading data from the object store `boxes`.");
          };
        } else {
          console.error("Object store 'boxes' does not exist.");
        }
      };

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
      };
    }
    readAndDisplayAllData();
  }, []);

  useEffect(() => {
    async function fetchPatchInfo() {
      try {
        const response = await api.get("/word/patch-info");
        setTotalB2(response.data.totalB2Patches);
        setTotalC1(response.data.totalC1Patches);
      } catch (error) {
        console.error("Error fetching patch info:", error);
      }
    }
    fetchPatchInfo();
  }, []);

  useEffect(() => {
    //save progress
    function saveBoxes() {
      let db;
      const request = indexedDB.open("SavedBoxes", 1);

      request.onupgradeneeded = (event) => {
        db = event.target.result;
        if (!db.objectStoreNames.contains("boxes")) {
          db.createObjectStore("boxes", { keyPath: "id" });
        } else {
          console.log('Object store "boxes" already exists.');
        }
      };

      request.onsuccess = (event) => {
        db = event.target.result;
        if (db.objectStoreNames.contains("boxes")) {
          const transaction = db.transaction(["boxes"], "readwrite");
          const store = transaction.objectStore("boxes");

          const clearRequest = store.clear();

          clearRequest.onsuccess = () => {
            const addRequests = [];

            for (const boxName in boxes) {
              boxes[boxName].forEach((item) => {
                const itemWithBox = { ...item, boxName };
                const addRequest = new Promise((resolve, reject) => {
                  const request = store.add(itemWithBox);
                  request.onsuccess = () => {
                    resolve();
                  };
                  request.onerror = () => {
                    reject(
                      `Error adding record from box '${boxName}' to the object store.`
                    );
                  };
                });
                addRequests.push(addRequest);
              });
            }

            // Wait for all add requests to complete
            Promise.all(addRequests)
              .then(() => {
                setAutoSave(false);
                console.log("Progress Saved");
              })
              .catch((error) => {
                setAutoSave(false);
                console.error("An error occurred:", error);
              });
          };

          clearRequest.onerror = () => {
            console.error(`Error clearing the object store 'boxes'.`);
          };
        } else {
          console.error("Object store 'boxes' does not exist.");
        }
      };

      request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
      };
    }
    if (autoSave) {
      saveBoxes();
    }
  }, [autoSave, boxes]);

  function confettiShow() {
    setShowConfetti(true);
    setGenerateConfetti(true);

    const generateTimer = setTimeout(() => {
      setGenerateConfetti(false);
    }, 2000);

    // Usuwamy komponent Confetti po dodatkowych 3 sekundach
    const hideTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => {
      clearTimeout(generateTimer);
      clearTimeout(hideTimer);
    };
  }

  return (
    <div className="container-home">
      <div className="home-left">
        {randomWord ? (
          <Flashcard
            data={randomWord}
            check={check}
            className={className}
            showWrongAnswer={showWrongAnswer}
            activeBox={activeBox}
            handleSetWordFlash={handleSetWordFlash}
            handleSetwordId={handleSetwordId}
            changeCorrectStatus={changeCorrectStatus}
            correctWordRef={correctWordRef}
            correctSecondWordRef={correctSecondWordRef}
            userWordRef={userWordRef}
          />
        ) : (
          <EmptyFlashcard />
        )}
        <Boxes
          boxes={boxes}
          activeBox={activeBox}
          handleSetBox={handleSetBox}
          addWords={addWords}
        />
      </div>
      <div className="home-right">
        <Progressbar
          procent={procent}
          text={intl.formatMessage({ id: "dailyProgress" })}
        />
        <Progressbar
          procent={totalPercent}
          text={intl.formatMessage({ id: "totalProgress" })}
        />
      </div>
      {showConfetti && <Confetti generateConfetti={generateConfetti} />}
    </div>
  );
}
