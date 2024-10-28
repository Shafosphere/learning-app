import "./words.css";
import { useContext, useState, useEffect, useMemo } from "react";
import api from "../../utils/api";
import InputField from "../../components/words/wordInput";
import { addNumberToGood, addNumberToWrong } from "../../utils/indexedDB";
import Progressbar from "../../components/home/bar/bar";
import Confetti from "../../components/words/confetti";
import ResultsSummary from "../../components/words/summary/resultssummary";
import { SettingsContext } from "../settings/properties";

export default function Words() {
  const [userWord, setWord] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [generateConfetti, setGenerateConfetti] = useState(false);

  //ustawienia
  const { diacritical } = useContext(SettingsContext);

  // Dane z serwera
  const [data, setData] = useState([]);
  const [patchNumber, setPatch] = useState(null);
  const [patchLength, setLength] = useState(null);

  // Indeks danych dla bottom-bot
  const [dataIndexForBottomDiv, setDataIndexForBottomDiv] = useState(() => {
    const savedIndex = localStorage.getItem("dataIndexForBottomDiv");
    return savedIndex ? parseInt(savedIndex) : 0;
  });

  //iscontent Ended?
  const [isThisLastOne, setLastOne] = useState(() => {
    const savedValue = localStorage.getItem("end");
    return savedValue === "true"; // Konwersja do wartości logicznej
  });

  //showummary?
  const [showSummary, setSummary] = useState(() => {
    const savedValue = localStorage.getItem("summary");
    return savedValue === "true"; // Konwersja do wartości logicznej
  });

  // Stan karuzeli
  const [carouselItems, setCarouselItems] = useState(null);

  const [mode, setMode] = useState(false);

  // Licznik odpowiedzi użytkownika
  const [wordsAnsweredCount, setWordsAnsweredCount] = useState(() => {
    const savedCount = localStorage.getItem("wordsAnsweredCount");
    return savedCount ? parseInt(savedCount) : 0;
  });

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
    const savedId = localStorage.getItem("lastDataItemId");
    return savedId ? parseInt(savedId) : null;
  });

  useEffect(() => {
    localStorage.setItem("end", isThisLastOne);
  }, [isThisLastOne]);

  useEffect(() => {
    localStorage.setItem("patchLength", patchLength);
  }, [patchLength]);

  useEffect(() => {
    localStorage.setItem("summary", showSummary);
  }, [showSummary]);

  useEffect(() => {
    const currentPatch = localStorage.getItem("currentPatch");
    setPatch(currentPatch ? parseInt(currentPatch) : 1);
  }, []);

  useEffect(() => {
    async function startGame() {
      if (patchNumber !== null) {
        const gameData = await getData(patchNumber);
        if (gameData && gameData.data && gameData.data.length > 0) {
          setData(gameData.data);
          setLastOne(gameData.isThisLastOne);
          setLength(gameData.totalPatches);
        } else {
          console.log("Brak danych");
        }
      }
    }

    startGame();
  }, [patchNumber]);

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

  // Inicjalizacja carouselItems po pobraniu danych
  useEffect(() => {
    if (data.length > 0 && carouselItems === null) {
      const savedCarouselItems = localStorage.getItem("carouselItems");
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
        localStorage.setItem("lastDataItemId", lastId);
        setLastDataItemId(lastId);
      }
    }
  }, [data, carouselItems]);

  useEffect(() => {
    if (carouselItems !== null) {
      localStorage.setItem("carouselItems", JSON.stringify(carouselItems));
    }
  }, [carouselItems]);

  useEffect(() => {
    localStorage.setItem("dataIndexForBottomDiv", dataIndexForBottomDiv);
  }, [dataIndexForBottomDiv]);

  useEffect(() => {
    localStorage.setItem("wordsAnsweredCount", wordsAnsweredCount);
  }, [wordsAnsweredCount]);

  function nextPatch() {
    const nextPatchNumber = patchNumber + 1;
    localStorage.setItem("currentPatch", nextPatchNumber);
    setPatch(nextPatchNumber);
  }

  async function getData(patchNumber) {
    try {
      const dataResponse = await api.post("/word/data", { patchNumber });
      return dataResponse.data;
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
      return null;
    }
  }

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

  function correctWordChange(event) {
    setWord(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      checkAnswer();
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
        localStorage.setItem("lastDataItemId", lastId);
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

  function handleClickKnow() {
    handleAnswer(true);
  }

  function handleClickDontKnow() {
    handleAnswer(false);
  }

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
              />
              <label
                htmlFor="checkboxInput"
                class="toggleSwitch rounded-left"
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
                class="toggleSwitch rounded-right"
              ></label>
            </div>
          </div>

          <div className="window-words">
            <div className="top-words">
              <div className="top-left-words">
                {!mode ? (
                  <InputField
                    userWord={userWord}
                    onChange={correctWordChange}
                    onKeyDown={handleKeyDown}
                  />
                ) : (
                  <div className="buttons-words">
                    <button
                      onClick={handleClickKnow}
                      className="button"
                      type="button"
                      style={{ "--buttonColor": "var(--tertiary)" }}
                    >
                      znam
                    </button>
                    <button
                      onClick={handleClickDontKnow}
                      className="button"
                      type="button"
                      style={{ "--buttonColor": "var(--tertiary)" }}
                    >
                      nie znam
                    </button>
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
