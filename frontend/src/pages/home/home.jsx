import "./home.css";
import axios from "axios";
import Flashcard from "../../components/home/card/flashcard";
import EmptyFlashcard from "../../components/home/card/empty-flashcard";
import Boxes from "../../components/home/box/box";
import dingSound from "../../data/ding.wav";
import dongSound from "../../data/dong.wav";
import Popup from "../../components/popup/popup";
import Progressbar from "../../components/home/bar/bar";

import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { addWord, getAllWords, getStatistics } from "../../utils/indexedDB";
import { SettingsContext } from "../settings/properties";
import { FormattedMessage, useIntl } from 'react-intl';
import api from "../../utils/api";

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

  //focus management
  const userWordRef = useRef(null);
  const correctWordRef = useRef(null);
  const correctSecondWordRef = useRef(null);

  //sound
  const dingSoundRef = useRef(new Audio(dingSound));
  const dongSoundRef = useRef(new Audio(dongSound));

  //popup
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");

  //progressBar
  const {
    calculatePercent,
    calculateTotalPercent,
    procent,
    totalPercent,
    isSoundEnabled,
    level,
  } = useContext(SettingsContext);

  function check(userWord, word, id) {
    if (userWord === word) {
      setClass("correct");
      clearTimeout(timeoutRef.current);
      if (isSoundEnabled === 'true') {
        dingSoundRef.current.play();
      }
      timeoutRef.current = setTimeout(() => {
        setClass("");
        moveWord(id, word, false);
        selectRandomWord(activeBox);
      }, 1500);
    } else {
      setClass("notcorrect");
      setShowWrongAnswer("visible");
      correctWordRef.current.focus();
      if (isSoundEnabled === 'true') {
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
      if (!wordIds.some(word => word.id === newid)) {
        await addWord(newid);
        calculatePercent();
        calculateTotalPercent();
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
    try {
      const response = await getData(); // Wait for the data to be fetched
      const newData = response.data.data; // Assuming the data is in response.data.data
      setBoxes((prevBoxes) => ({
        ...prevBoxes,
        boxOne: [...prevBoxes.boxOne, ...newData], // Spread the newData into the array
      }));
      if (activeBox === "boxOne") {
        selectRandomWord(activeBox);
      }
    } catch (error) {
      console.error(intl.formatMessage({ id: "errorAddingWords" }), error);
    }
  }

  async function getData() {
    const boxOrder = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];
    let words_used = [];
    let maxWordId;
    let minWordId;
    let b2;
    let maxRange;
  
    try {
      const response = await api.get("/word/information");
      minWordId = response.data.minWordId;
      maxWordId = response.data.maxWordId;
      b2 = response.data.b2;
    } catch (error) {
      console.log(error);
    }

    // Ustal zakres na podstawie poziomu trudności
    if (level === "B2") {
      maxRange = b2;
    } else if (level === "C1") {
      maxRange = maxWordId;
    } else {
      throw new Error("Nieznany poziom trudności");
    }
  
    // Pobieranie już użytych słów
    const wordIds = new Set(await getAllWords());
  
    // Zbieranie ID słów z boxów
    boxOrder.forEach((item) => {
      boxes[item].forEach((second_item) => {
        words_used.push(second_item.id);
      });
    });
    words_used = new Set(words_used);
  
    // Losowanie 20 unikalnych identyfikatorów z uwzględnieniem już użytych
    let wordList = new Set();
    while (wordList.size < 20) {
      const randomWordId = Math.floor(Math.random() * (maxRange - minWordId + 1)) + minWordId;
  
      if (!wordIds.has(randomWordId) && !words_used.has(randomWordId)) {
        wordList.add(randomWordId);
      }
    }
  
    wordList = Array.from(wordList);
  
    try {
      const response = await axios.post(
        "http://localhost:8080/word/data",
        { wordIds: Array.from(wordIds), words_used: Array.from(words_used), wordList },
        { withCredentials: true }
      );
      return response;
    } catch (error) {
      console.error("Data error:", error);
      throw error;
    }
  }
  

  //save progress
  function brunWords() {
    // console.log(boxes[activeBox][1].id);
    let db;
    // Increment the version number to force onupgradeneeded to fire
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
          console.log(`Object store 'boxes' has been cleared.`);

          // Array to hold all the add requests
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
              setPopupEmotion("positive");
              setPopupMessage(intl.formatMessage({ id: "wordsSaved" }));
            })
            .catch((error) => {
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

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    function readAndDisplayAllData() {
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
          brunWords={brunWords}
        />
        {popupMessage && (
          <Popup
            message={popupMessage}
            emotion={popupEmotion}
            onClose={() => setPopupMessage("")}
          />
        )}
      </div>
      <div className="home-right">
        <Progressbar procent={procent} text={intl.formatMessage({ id: "dailyProgress" })} />
        <Progressbar procent={totalPercent} text={intl.formatMessage({ id: "totalProgress" })} />
      </div>
    </div>
  );
}