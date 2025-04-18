import { useEffect, useState, useRef, useCallback } from "react";
import MyButton from "../button/button";
import api from "../../utils/api";
import MyCustomChart from "./chart";
import polandFlag from "../../data/poland-small.png";
import usaFlag from "../../data/united-states-small.png";
import ScrambledText from "./ScrambledText";
import { useWindowWidth } from "../../hooks/window_width/windowWidth";
export default function ArenaContent() {
  const [data, setData] = useState([]);
  const [userWord, setUserWord] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [correctTranslations, setCorrectTranslations] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [lastAnswerStatus, setLastAnswerStatus] = useState(null);
  const [chartData, setChartData] = useState([]);
  const inputRef = useRef(null);
  const [cards, setCards] = useState(
    Array(10).fill({
      Move: 0,
      Rotate: 0,
      zIndex: 1,
      chosen: false,
      isPrevious: false,
      previousContent: null,
      content: " .. ",
    })
  );

  // Hook do sprawdzenia szerokości okna
  const windowWidth = useWindowWidth();

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchNewWords();
      await fetchNewWord();
      setCards((prevCards) => {
        if (prevCards.length === 0) return prevCards;
        const randomIndex = Math.floor(Math.random() * prevCards.length);
        return prevCards.map((card, index) => ({
          ...card,
          chosen: index === randomIndex,
          zIndex: index === randomIndex ? 11 : 1,
        }));
      });
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      inputRef.current?.focus();
    }
  }, [data]);

  useEffect(() => {
    if (chartData.length > 0) {
      setUserPoints(chartData[chartData.length - 1]);
    }
  }, [chartData]);

  useEffect(() => {
    const fetchRankingHistory = async () => {
      try {
        const response = await api.get("/word/history");
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching ranking history:", error);
      }
    };
    fetchRankingHistory();
  }, []);

  const fetchNewWord = async () => {
    try {
      const response = await api.get("/word/ranking-word");
      if (response.data && response.data.length >= 2) {
        setData(response.data);
        setStartTime(Date.now());
      }
    } catch (error) {
      console.error("Error fetching word:", error);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      if (!data || !data[0]) {
        console.error("Missing data");
        return;
      }

      const language = data[2] === "pl" ? "en" : "pl";

      const response = await api.post("/word/submit-answer", {
        wordId: data[0],
        userAnswer: userWord,
        lang: language,
        startTime: startTime,
      });

      if (response.data.success) {
        setChartData((prev) => {
          const newData = [...prev, response.data.newPoints];
          return newData.slice(-10);
        });

        setCorrectTranslations(response.data.correctTranslations);
        setLastAnswerStatus(response.data.isCorrect);
        setUserWord("");

        const currentContent = data[1];
        await shuffle(currentContent);
        await fetchNewWord();

        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNewWords = async () => {
    try {
      const response = await api.get("/word/random-words?count=10");
      const newCards = response.data.map((word, index) => ({
        Move: 0,
        Rotate: 0,
        zIndex: index + 1,
        chosen: false,
        content: word.content,
      }));
      setCards(newCards);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const shuffle = useCallback(
    (currentContent) => {
      const currentChosenIndex = cards.findIndex((card) => card.chosen);
      const newCards = [...cards];

      if (currentChosenIndex !== -1) {
        newCards[currentChosenIndex] = {
          ...newCards[currentChosenIndex],
          isPrevious: true,
          previousContent: currentContent,
          chosen: false,
          zIndex: 1,
        };
      }

      let randomCardIndex;
      do {
        randomCardIndex = Math.floor(Math.random() * newCards.length);
      } while (newCards.length > 1 && randomCardIndex === currentChosenIndex);

      // Domyślne wartości animacji
      let ENTRANCE_OFFSET = -3;
      let ENTRANCE_ROTATION = 5;

      // Wyzerowanie jeśli <768px
      if (windowWidth < 768) {
        ENTRANCE_OFFSET = 0;
        ENTRANCE_ROTATION = 0;
      }

      newCards.forEach((card, index) => {
        if (index === randomCardIndex) {
          newCards[index] = {
            ...card,
            Move: ENTRANCE_OFFSET,
            Rotate: ENTRANCE_ROTATION,
            chosen: true,
            zIndex: 11,
          };
        } else {
          const isUp = Math.random() < 0.5;
          let offset = Math.floor(Math.random() * 2) + 1;
          let randomAngle = Math.floor(Math.random() * 5) + 5;

          // Również wyzerowanie offsetu i kąta przy małym oknie
          if (windowWidth < 768) {
            offset = 0;
            randomAngle = 0;
          }

          const move = isUp ? -offset : offset;
          const rotate = isUp ? randomAngle : -randomAngle;

          newCards[index] = {
            ...card,
            Move: move,
            Rotate: -rotate,
            chosen: false,
            zIndex: 1,
          };
        }
      });

      setCards(newCards);

      setTimeout(() => {
        setCards((currentCards) =>
          currentCards.map((card) => ({
            ...card,
            Move: 0,
            Rotate: 0,
            isPrevious: false,
            previousContent: null,
          }))
        );
      }, 750);
    },
    [cards, windowWidth]
  );

  async function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSubmit();
    }
  }

  return (
    <>
      <div className="game">
        <div className="main-game">
          <div className="main-arena">
            <div className="answer-arena">
              {correctTranslations.length > 0 && (
                <div
                  className={`answer-feedback ${
                    lastAnswerStatus ? "good-arena" : "wrong-arena"
                  }`}
                >
                  {correctTranslations.map((t, index) => (
                    <span key={index}>
                      <ScrambledText
                        text={String(t.translation)}
                        duration={2000}
                        interval={40}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div
              className={`points-arena ${
                lastAnswerStatus ? "good-arena" : "wrong-arena"
              }`}
            >
              {userPoints !== undefined && (
                <ScrambledText
                  text={String(userPoints)}
                  duration={2000}
                  interval={40}
                />
              )}
            </div>
            <div className="left-arena">
              <div className="flag-arena">
                <div className="flags">
                  {data[2] === "pl" && <img alt="english" src={usaFlag} />}
                  {data[2] === "en" && <img alt="polish" src={polandFlag} />}
                </div>
              </div>
              <div className="input-arena">
                <input
                  value={userWord}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setUserWord(e.target.value)}
                  className="arena-input"
                  disabled={isLoading}
                  ref={inputRef}
                />
              </div>
            </div>
            <div className="right-arena">
              <div className="deck">
                {cards.map((item, index) => (
                  <div
                    className={`card ${item.chosen ? "chosen_card" : ""} ${
                      item.isPrevious ? "previous_card" : ""
                    }`}
                    key={index}
                    style={{
                      transform: `translateY(${item.Move}rem) rotate(${item.Rotate}deg)`,
                      zIndex: item.zIndex,
                      opacity: item.isPrevious ? 0.5 : item.chosen ? 1 : 0.8,
                    }}
                  >
                    {item.chosen
                      ? data?.[1] || "Ładowanie..."
                      : item.isPrevious
                      ? item.previousContent
                      : item.content}
                  </div>
                ))}
              </div>
            </div>
            <div className="button-arena">
              <MyButton
                message="Confirm"
                color="green"
                onClick={handleSubmit}
                disabled={isLoading}
              />
            </div>
            <div className="placeholder-arena"></div>
          </div>
        </div>
        <div className="chart">
          <MyCustomChart ranks={chartData} />
        </div>
      </div>
    </>
  );
}
