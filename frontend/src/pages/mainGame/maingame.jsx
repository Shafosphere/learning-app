import "./maingame.css";
import Flashcard from "../../components/maingame/card/flashcard";
import EmptyFlashcard from "../../components/maingame/card/empty-flashcard";
import Boxes from "../../components/maingame/box/box";
import dingSound from "../../data/ding.wav";
import dongSound from "../../data/dong.wav";
import NewProgressBar from "../../components/progress_bar/progressbar";

import Confetti from "../../components/confetti/confetti";

import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { addWord, getAllWords } from "../../utils/indexedDB";
import { SettingsContext } from "../settings/properties";
import { PopupContext } from "../../components/popup/popupcontext";
import { useIntl } from "react-intl";
import api from "../../utils/api";

import useBoxesDB from "../../hooks/boxes/useBoxesDB";
import usePersistedState from "../../hooks/localstorage/usePersistedState";
import useSpellchecking from "../../hooks/spellchecking/spellchecking";
import usePageVisit from "../../hooks/activity/countingentries";

export default function MainGame({ setDisplay, lvl }) {
  const { boxes, setBoxes, setAutoSave } = useBoxesDB(lvl);

  const intl = useIntl();
  const [randomWord, setRandom] = useState(null); //selected word
  const [className, setClass] = useState(""); //class display
  const [showWrongAnswer, setShowWrongAnswer] = useState("not-visible");
  const [activeBox, setActiveBox] = useState("boxOne"); //clicked box
  const timeoutRef = useRef(null);
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

  const [totalB2Patches, setTotalB2] = useState(null);
  const [totalC1Patches, setTotalC1] = useState(null);

  //progressBar
  const {
    calculatePercent,
    calculateTotalPercent,
    isSoundEnabled,
    totalPercentB2,
    totalPercentC1,
    procentC1,
    procentB2,
    isLoggedIn,
  } = useContext(SettingsContext);

  usePageVisit("flashcards");

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
      const wordIds = await getAllWords(lvl);
      if (!wordIds.some((word) => word.id === newid)) {
        await addWord(newid, lvl);
        calculatePercent(lvl);
        calculateTotalPercent(lvl);
        confettiShow();
        if (isLoggedIn) {
          await sendLearnedWordToServer(newid);
        }
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
    setAutoSave(true);
  }

  async function addWords() {
    await getNextPatch();
  }

  async function getNextPatch() {
    try {
      let levelToFetch = lvl;

      let patchNumber = levelToFetch === "B2" ? patchNumberB2 : patchNumberC1;
      let totalPatches =
        levelToFetch === "B2" ? totalB2Patches : totalC1Patches;

      if (patchNumber > totalPatches) {
        setPopup({
          message: "Pobrales wszystkie słowa z tego poziomu!",
          emotion: "positive",
        });
        return;
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
      console.log("sprawdzam " + userWord + " i " + word);
      const isCorrect = checkSpelling(userWord, word);
      console.log("słówka sprawdzone: " + isCorrect);
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

  async function sendLearnedWordToServer(wordId) {
    try {
      const response = await api.post("/user/learn-word", { wordId });
      console.log("Słówko zostało zgłoszone do serwera:", response.data);
    } catch (error) {
      console.error("Błąd podczas wysyłania słówka do serwera:", error);
    }
  }

  return (
    <div className="container-home">
      <div className="return-btn-voca" onClick={() => setDisplay("default")}>
        <h1>{lvl}</h1>
      </div>
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
        {lvl === "B2" && (
          <>
            <NewProgressBar
              vertical={true}
              percent={procentB2}
              text={intl.formatMessage({ id: "dailyProgress" })}
            />
            <NewProgressBar
              vertical={true}
              percent={totalPercentB2}
              text={intl.formatMessage({ id: "totalProgress" }) + " B2"}
            />
          </>
        )}
        {lvl === "C1" && (
          <>
            <NewProgressBar
              vertical={true}
              percent={procentC1}
              text={intl.formatMessage({ id: "dailyProgress" })}
            />
            <NewProgressBar
              vertical={true}
              percent={totalPercentC1}
              text={intl.formatMessage({ id: "totalProgress" }) + " C1"}
            />
          </>
        )}
      </div>

      {showConfetti && <Confetti generateConfetti={generateConfetti} />}
    </div>
  );
}
