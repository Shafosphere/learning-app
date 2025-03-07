import "./maingame.css";
import Flashcard from "../../components/maingame/card/flashcard";
import EmptyFlashcard from "../../components/maingame/card/empty-flashcard";
import Boxes from "../../components/maingame/boxex/boxex";
import NewProgressBar from "../../components/progress_bar/progressbar";
import Confetti from "../../components/confetti/confetti";
import ConfirmWindow from "../../components/confirm/confirm";

import dingSound from "../../data/ding.wav";
import dongSound from "../../data/dong.wav";
import api from "../../utils/api";

import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useIntl } from "react-intl";

// *** 1. Konteksty i custom hooki ***
import { SettingsContext } from "../settings/properties";
import { PopupContext } from "../../components/popup/popupcontext";
import useBoxesDB from "../../hooks/boxes/useBoxesDB";
import usePersistedState from "../../hooks/localstorage/usePersistedState";
import useSpellchecking from "../../hooks/spellchecking/spellchecking";
import usePageVisit from "../../hooks/activity/countingentries";
import useMoveWord from "../../hooks/boxes/useMoveWord";
import usePatch from "../../hooks/boxes/usePatch";

export default function MainGame({ setDisplay, lvl }) {
  const intl = useIntl();

  // Patch – numeracja i stany
  const [patchNumberB2, setB2Patch] = usePersistedState(
    "patchNumberB2-maingame",
    1
  );
  const [patchNumberC1, setC1Patch] = usePersistedState(
    "patchNumberC1-maingame",
    1
  );
  const [totalB2Patches, setTotalB2] = useState(null);
  const [totalC1Patches, setTotalC1] = useState(null);

  //confirm
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);
  const [isConflict, setIsConflict] = useState(false);
  const [confirmParams, setConfirmParams] = useState(null);

  const handleConfirmClose = (result) => {
    setConfirmMessage("");
    if (confirmCallback) {
      confirmCallback(result);
    }
  };

  const showConfirm = (localTimestamp, serverTimestamp) => {
    const formatDate = (timestamp) =>
      new Date(timestamp).toLocaleString(undefined, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

    return new Promise((resolve) => {
      setConfirmParams({
        conflict: true,
        localDate: formatDate(localTimestamp),
        serverDate: formatDate(serverTimestamp),
      });
      setConfirmCallback(() => resolve);
    });
  };

  // *** 2. Stany i refy – logika danych ***
  const { boxes, setBoxes, setAutoSave } = useBoxesDB(
    lvl,
    patchNumberB2,
    patchNumberC1,
    setB2Patch,
    setC1Patch,
    showConfirm
  );

  // Ustawienia z kontekstu
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

  // Popup z kontekstu
  const { setPopup } = useContext(PopupContext);

  // Inicjujemy liczniki odwiedzin strony
  usePageVisit("flashcards");

  // Stan dla wylosowanego słowa i stanu UI
  const [randomWord, setRandom] = useState(null);
  const [className, setClass] = useState("");
  const [cssClasses, setCssClasses] = useState({
    notVisible: "not-visible",
    notDisplay: "not-display",
    notDisplayReverse: "display",
  });

  // const [showWrongAnswer, setShowWrongAnswer] = useState("not-visible");
  const [activeBox, setActiveBox] = useState("boxOne");
  const [blockSwitch, setBlock] = useState(false);

  // Confetti
  const [showConfetti, setShowConfetti] = useState(false);
  const [generateConfetti, setGenerateConfetti] = useState(false);

  // *** 3. Refy ***
  const timeoutRef = useRef(null);
  const wordFlashcardRef = useRef(null);
  const idFlashcardRef = useRef(null);
  const userWordRef = useRef(null);
  const correctWordRef = useRef(null);
  const correctSecondWordRef = useRef(null);
  const dingSoundRef = useRef(new Audio(dingSound));
  const dongSoundRef = useRef(new Audio(dongSound));

  // *** 4. Custom hooki i metody z nich wynikające ***
  const checkSpelling = useSpellchecking();
  const { moveWord } = useMoveWord({
    boxes,
    setBoxes,
    activeBox,
    randomWord,
    setRandom,
    lvl,
    confettiShow,
    calculatePercent,
    calculateTotalPercent,
    isLoggedIn,
    sendLearnedWordToServer,
    setAutoSave,
  });

  const { getNextPatch } = usePatch({
    lvl,
    patchNumberB2,
    patchNumberC1,
    totalB2Patches,
    totalC1Patches,
    setPopup,
    setBoxes,
    setAutoSave,
    setB2Patch,
    setC1Patch,
    activeBox,
    selectRandomWord,
  });

  // *** 5. Funkcje pomocnicze ***
  function check(userWord, word) {
    if (checkAnswer(userWord, word)) {
      setClass("correct");
      clearTimeout(timeoutRef.current);
      if (isSoundEnabled === "true") dingSoundRef.current.play();

      timeoutRef.current = setTimeout(() => {
        setClass("");
        moveWord(word, false);
        selectRandomWord(activeBox);
        setAutoSave(true);
        userWordRef.current.focus();
      }, 1500);
    } else {
      setClass("notcorrect");

      setCssClasses({
        notVisible: "visible",
        notDisplay: "visible",
        notDisplayReverse: "not-display",
      });

      // correctWordRef.current.focus();
      setBlock(true);
      if (isSoundEnabled === "true") dongSoundRef.current.play();
    }
  }

  function checkAnswer(userWord, word) {
    if (userWord && word) {
      return checkSpelling(userWord, word);
    }
    console.log("Brak danych do porównania!");
    return false;
  }

  const handleSetWordFlash = useCallback((item) => {
    wordFlashcardRef.current = item;
  }, []);

  const handleSetwordId = useCallback((item) => {
    idFlashcardRef.current = item;
  }, []);

  function changeCorrectStatus() {
    setClass("");
    moveWord(wordFlashcardRef.current, true);
    selectRandomWord(activeBox);
    setCssClasses({
      notVisible: "not-visible",
      notDisplay: "not-display",
      notDisplayReverse: "display",
    });

    setAutoSave(true);
    userWordRef.current.focus();
    setBlock(false);
  }

  function handleSetBox(item) {
    if (blockSwitch) return;
    selectRandomWord(item);
    setActiveBox(item);
  }

  async function addWords() {
    await getNextPatch();
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

      setRandom(prevBoxes[item][randomIndex]);
      return prevBoxes;
    });
  }

  function confettiShow() {
    setShowConfetti(true);
    setGenerateConfetti(true);

    const generateTimer = setTimeout(() => setGenerateConfetti(false), 2000);
    const hideTimer = setTimeout(() => setShowConfetti(false), 4000);

    return () => {
      clearTimeout(generateTimer);
      clearTimeout(hideTimer);
    };
  }

  async function sendLearnedWordToServer(wordId) {
    try {
      const response = await api.post("/user/learn-word", { wordId });
      console.log("Słówko zgłoszone do serwera:", response.data);
    } catch (error) {
      console.error("Błąd wysyłania słówka:", error);
    }
  }

  // *** 6. Efekty uboczne ***
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  useEffect(() => {
    if (userWordRef.current) {
      userWordRef.current.focus();
    }
  }, [activeBox]);

  useEffect(() => {
    async function fetchPatchInfo() {
      try {
        const response = await api.get("/word/patch-info");
        setTotalB2(response.data.totalB2Patches);
        setTotalC1(response.data.totalC1Patches);
      } catch (error) {
        console.error("Błąd patch info:", error);
      }
    }
    fetchPatchInfo();
  }, []);

  // *** 7. Render komponentu ***
  return (
    <div className="container-maingame">
      <div className="return-btn-voca" onClick={() => setDisplay("default")}>
        <h1>{lvl}</h1>
      </div>

      <div className="maingame-left">
        {randomWord ? (
          <Flashcard
            data={randomWord}
            check={check}
            className={className}
            cssClasses={cssClasses}
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

      <div className="maingame-right">
        {["B2", "C1"].includes(lvl) && (
          <>
            <NewProgressBar
              vertical
              percent={lvl === "B2" ? procentB2 : procentC1}
              text={intl.formatMessage({ id: "dailyProgress" })}
            />
            <NewProgressBar
              vertical
              percent={lvl === "B2" ? totalPercentB2 : totalPercentC1}
              text={`${intl.formatMessage({ id: "totalProgress" })} ${lvl}`}
            />
          </>
        )}
      </div>

      {confirmParams && (
        <ConfirmWindow {...confirmParams} onClose={handleConfirmClose} />
      )}
      {showConfetti && <Confetti generateConfetti={generateConfetti} />}
    </div>
  );
}
