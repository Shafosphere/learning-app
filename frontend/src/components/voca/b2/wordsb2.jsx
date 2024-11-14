import "./words.css";
import { useContext, useState, useEffect, useMemo } from "react";
import api from "../../../utils/api";
import InputField from "../wordInput";
import { addNumberToGood, addNumberToWrong } from "../../../utils/indexedDB";
import Progressbar from "../../home/bar/bar";
import Confetti from "../confetti";
import ResultsSummary from "../summary/resultssummary";
import { SettingsContext } from "../../../pages/settings/properties";
import MyButton from "../../button/button";
import usePersistedState from "../../settings/usePersistedState";

export default function WordsB2({setDisplay}) {
  const [userWord, setWord] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [generateConfetti, setGenerateConfetti] = useState(false);

  //ustawienia
  const { diacritical } = useContext(SettingsContext);

  // Dane z serwera
  const [data, setData] = useState([]);
  const [patchNumber, setPatch] = usePersistedState("currentPatch-b2", 1);
  const [patchLength, setLength] = usePersistedState("patchLength-b2", null);

  // Indeks danych dla bottom-bot
  const [dataIndexForBottomDiv, setDataIndexForBottomDiv] = usePersistedState(
    "dataIndexForBottomDiv-b2",
    0
  );

  //iscontent Ended?
  const [isThisLastOne, setLastOne] = usePersistedState("end-b2", false);

  //showummary?
  const [showSummary, setSummary] = usePersistedState("summary-b2", false);

  // Stan karuzeli
  const [carouselItems, setCarouselItems] = useState(null);
  const [mode, setMode] = useState(true);

  useEffect(() => {
    if (carouselItems !== null) {
      localStorage.setItem("carouselItems-b2", JSON.stringify(carouselItems));
    }
  }, [carouselItems]);

  // Licznik odpowiedzi użytkownika
  const [wordsAnsweredCount, setWordsAnsweredCount] = usePersistedState(
    "wordsAnsweredCount-b2",
    0
  );

  // Obliczanie procentu za pomocą useMemo
  const percent = useMemo(() => {
    if (data.length > 0) {
      return ((wordsAnsweredCount / data.length) * 100).toFixed(2);
    } else {
      return 0;
    }
  }, [wordsAnsweredCount, data]);

  const totalpercent = useMemo(() => {
    if (data.length > 0) {
      return ((patchNumber / patchLength) * 100).toFixed(2);
    } else {
      return 0;
    }
  }, [patchNumber, patchLength, data]);

  const [showPercent, setShowPercent] = useState(false);
  /////

  
  const [lastDataItemId, setLastDataItemId] = useState(() => {
    const savedId = localStorage.getItem("lastDataItemId-b2");
    return savedId ? parseInt(savedId) : null;
  });

  useEffect(() => {
    async function fetchPatchInfo() {
      try {
        const response = await api.get("/word/patch-info");
    
        // Pobierz dane z odpowiedzi
        const maxPatchId = response.data.totalB2Patches;
        const lengthB2patch = response.data.lengthB2patch;
    
        // Ustaw stany
        setLastOne(patchNumber === maxPatchId); // Sprawdza, czy bieżący numer to ostatni
        setLength(lengthB2patch); // Ustawia długość
      } catch (error) {
        console.error("Error fetching patch info:", error);
      }
    }
    

    async function startGame() {
      if (patchNumber !== null) {
        const gameData = await requestPatch(patchNumber);
        if (gameData && gameData.data && gameData.data.length > 0) {
          setData(gameData.data);
        } else {
          console.log("Brak danych");
        }
      }
    }

    fetchPatchInfo();
    startGame();

  }, [patchNumber, setLastOne, setLength]);

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

  //data
  function nextPatch() {
    const nextPatchNumber = patchNumber + 1;
    localStorage.setItem("currentPatch-b2", nextPatchNumber);
    setPatch(nextPatchNumber);
  }

  async function requestPatch(patchNumber) {
  let level;
    try {
      const response = await api.post("/word/patch-data", {
        level: 'B2',
        patchNumber: patchNumber,
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${level} patch ${patchNumber}:`, error);
      throw error;
    }
  }


  //carouselItems
  useEffect(() => {
    if (data.length > 0 && carouselItems === null) {
      const savedCarouselItems = localStorage.getItem("carouselItems-b2");
      if (savedCarouselItems) {
        setCarouselItems(JSON.parse(savedCarouselItems));
      } else {
        setCarouselItems([
          { id: 1, className: "top-bot", data: null },
          { id: 2, className: "top", data: null },
          { id: 3, className: "middle", data: data[0] },
          { id: 4, className: "bottom", data: data[1] },
          { id: 5, className: "bottom-bot", data: data[2] },
        ]);
        setDataIndexForBottomDiv(3);

        const lastId = data[data.length - 1].id;
        localStorage.setItem("lastDataItemId-b2", lastId);
        setLastDataItemId(lastId);
      }
    }
  }, [data, carouselItems, setDataIndexForBottomDiv, setCarouselItems]);

  function moveCarousel() {
    setCarouselItems((prevItems) => {
      // Pobieramy klasy CSS
      const classNames = prevItems.map((item) => item.className);

      // Rotujemy klasy CSS
      const lastClassName = classNames[classNames.length - 1];
      const newClassNames = [
        lastClassName,
        ...classNames.slice(0, classNames.length - 1),
      ];

      // Aktualizujemy klasy CSS w divach
      const newItems = prevItems.map((item, index) => ({
        ...item,
        className: newClassNames[index],
      }));

      return newItems;
    });
  }

  function carouselUpdate() {
    if (data.length > 0) {
      setCarouselItems((prevItems) => {
        const bottomBotIndex = prevItems.findIndex(
          (item) => item.className === "bottom-bot"
        );

        const newItems = prevItems.map((item, index) => {
          if (index === bottomBotIndex) {
            return {
              ...item,
              data: data[dataIndexForBottomDiv],
            };
          }
          return item;
        });

        return newItems;
      });

      setDataIndexForBottomDiv((prevIndex) => {
        if (prevIndex === data.length - 1) {
          nextPatch();
          return 0;
        } else {
          return prevIndex + 1;
        }
      });
    }
  }

  //sprawdz odp
  function checkAnswer() {
    const currentItem = carouselItems.find(
      (item) => item.className === "middle"
    );

    if (currentItem && currentItem.data && currentItem.data.wordPl) {
      const correctAnswer = currentItem.data.wordPl.word || "";

      // Jeśli `diacritical` jest false, normalizujemy odpowiedzi do porównania
      const processedUserWord = diacritical
        ? userWord
        : normalizeText(userWord);
      const processedCorrectAnswer = diacritical
        ? correctAnswer
        : normalizeText(correctAnswer);

      if (
        processedUserWord.trim().toLowerCase() ===
        processedCorrectAnswer.toLowerCase()
      ) {
        handleAnswer(true);
      } else {
        handleAnswer(false);
      }
    } else {
      console.log("Brak danych do porównania!");
    }
  }

  function handleAnswer(isCorrect) {
    const currentItem = carouselItems.find(
      (item) => item.className === "middle"
    );

    if (currentItem && currentItem.data) {
      const idOfTheWord = currentItem.data.id || "";

      if (isCorrect) {
        addNumberToGood(idOfTheWord);
        console.log("good");
      } else {
        addNumberToWrong(idOfTheWord);
        console.log("wrong");
      }

      setWordsAnsweredCount((prevCount) => prevCount + 1);

      if (currentItem.data.id === lastDataItemId) {
        setWordsAnsweredCount(0);

        const lastId = data[data.length - 1].id;
        localStorage.setItem("lastDataItemId-b2", lastId);
        setLastDataItemId(lastId);
        confettiShow();

        if (isThisLastOne) {
          setSummary(true);
        }
      }

      setWord("");
      moveCarousel();
      carouselUpdate();
    } else {
      console.log("Brak danych do przetworzenia!");
    }
  }

  //polish diacritical
  function normalizeText(text) {
    return text
      .replace(/ą/g, "a")
      .replace(/ć/g, "c")
      .replace(/ę/g, "e")
      .replace(/ł/g, "l")
      .replace(/ń/g, "n")
      .replace(/ó/g, "o")
      .replace(/ś/g, "s")
      .replace(/ź/g, "z")
      .replace(/ż/g, "z");
  }

  //reaction
  function handleClickKnow() {
    handleAnswer(true);
  }

  function handleClickDontKnow() {
    handleAnswer(false);
  }

  function correctWordChange(event) {
    setWord(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      checkAnswer();
    }
  }

  return (
    <div className="container-words">
      {showSummary ? (
        <ResultsSummary />
      ) : (
        <>
          <div className="switch-container-words">
            <div>
              <input
                onChange={() => setMode(mode ? false : true)}
                type="checkbox"
                id="checkboxInput"
                checked={mode} 
              />
              <label
                htmlFor="checkboxInput"
                className="toggleSwitch rounded-left"
              ></label>
            </div>

            <div>
              <input
                onChange={() => setShowPercent(showPercent ? false : true)}
                type="checkbox"
                id="checkboxInputPercent"
              />
              <label
                htmlFor="checkboxInputPercent"
                className="toggleSwitch rounded-right"
              ></label>
            </div>
          </div>

          <div className="window-words">
          <div
              className="return-btn-voca"
              onClick={() => setDisplay("default")}
            >
              <h1> B2 </h1>
            </div>


            <div className="top-words">
              <div className="top-left-words">
                {mode ? (
                  <InputField
                    userWord={userWord}
                    onChange={correctWordChange}
                    onKeyDown={handleKeyDown}
                  />
                ) : (
                  <div className="buttons-words">
                    <MyButton
                      message="znam"
                      color="green"
                      onClick={handleClickKnow}
                    />
                    <MyButton
                      message="nie znam"
                      color="red"
                      onClick={handleClickDontKnow}
                    />
                  </div>
                )}
              </div>
              <div className="top-right-words">
                {carouselItems ? (
                  carouselItems.map((item) => (
                    <div
                      key={item.id}
                      className={`box-words ${item.className}`}
                    >
                      {item.data ? item.data.wordEng.word : ""}
                    </div>
                  ))
                ) : (
                  <div>Ładowanie...</div>
                )}
              </div>
            </div>
            <div className="bot-words">
              {!showPercent ? (
                <div className="progressbar-words">
                  <label>{percent} % poznane słówka z tej częśći</label>
                  <div className="progressbar-words-containter">
                    <Progressbar procent={percent} barHeight="60rem" />
                  </div>
                </div>
              ) : (
                <div className="progressbar-words">
                  <label>{totalpercent} % ukończone częśći </label>
                  <div className="progressbar-words-containter">
                    <Progressbar procent={totalpercent} barHeight="60rem" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
      {showConfetti && <Confetti generateConfetti={generateConfetti} />}
    </div>
  );
}