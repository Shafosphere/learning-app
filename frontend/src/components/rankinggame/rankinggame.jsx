import { useEffect, useState, useRef, useCallback } from "react";
import MyButton from "../button/button";
import api from "../../utils/api";
import MyCustomChart from "./chart";
import polandFlag from "../../data/poland-small.png";
import usaFlag from "../../data/united-states-small.png";
import ScrambledText from "./ScrambledText";

export default function RankingGameContent() {
  const [data, setData] = useState([]);
  const [userWord, setUserWord] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [correctTranslations, setCorrectTranslations] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [lastAnswerStatus, setLastAnswerStatus] = useState(null);
  const [chartData, setChartData] = useState([]);
  const inputRef = useRef(null);
  // const [isInitialized, setIsInitialized] = useState(false);
  const [cards, setCards] = useState(
    Array(10).fill({
      Move: 0,
      Rotate: 0,
      zIndex: 1,
      chosen: false,
      content: " .. ",
    })
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchNewWords();
      await fetchNewWord();
      // Oznacz jedną kartę jako wybraną po inicjalizacji
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
        console.log(response.data);
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

        // Najpierw aktualizacje stanów
        await shuffle();
        await fetchNewWord();

        // Następnie focus po aktualizacji
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50); // Krótkie opóźnienie dla stabilności
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

  const shuffle = useCallback(() => {
    const currentChosenIndex = cards.findIndex((card) => card.chosen);
    let randomCardIndex = Math.floor(Math.random() * cards.length);
    if (currentChosenIndex !== -1 && cards.length > 1) {
      while (randomCardIndex === currentChosenIndex) {
        randomCardIndex = Math.floor(Math.random() * cards.length);
      }
    }
    const newCards = cards.map((card, index) => {
      const isUp = Math.random() < 0.5;
      const offset = Math.floor(Math.random() * 3) + 3;
      const move = isUp ? -offset : offset;
      const randomAngle = Math.floor(Math.random() * 15) + 5;
      const rotate = isUp ? randomAngle : -randomAngle;
      const chosen = index === randomCardIndex;
      const zIndex = chosen ? 11 : 1;
      return {
        ...card,
        Move: move,
        Rotate: rotate,
        zIndex: zIndex,
        chosen: chosen,
      };
    });

    setCards(newCards);

    setTimeout(() => {
      setCards((currentCards) =>
        currentCards.map((card) => ({
          ...card,
          Move: 0,
          Rotate: 0,
        }))
      );
    }, 750);
  }, [cards]);

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
          <div className="main-rankinggame">
            <div className="answer-rankinggame">
              {correctTranslations.length > 0 && (
                <div
                  className={`answer-feedback ${
                    lastAnswerStatus ? "good-rankinggame" : "wrong-rankinggame"
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
              className={`points-rankinggame ${
                lastAnswerStatus ? "good-rankinggame" : "wrong-rankinggame"
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
            <div className="left-rankinggame">
              <div className="flag-rankinggame">
                <div className="flags">
                  {data[2] === "pl" && <img alt="english" src={usaFlag} />}
                  {data[2] === "en" && <img alt="polish" src={polandFlag} />}
                </div>
              </div>
              <div className="input-rankinggame">
                <input
                  value={userWord}
                  onKeyDown={handleKeyDown}
                  onChange={(e) => setUserWord(e.target.value)}
                  className="rankinggame-input"
                  disabled={isLoading}
                  ref={inputRef}
                />
              </div>
            </div>
            <div className="right-rankinggame">
              <div className="deck">
                {cards.map((item, index) => (
                  <div
                    className={`card ${item.chosen ? "chosen_card" : ""}`}
                    key={index}
                    style={{
                      transform: `translateY(${item.Move}rem) rotate(${item.Rotate}deg)`,
                      zIndex: item.zIndex,
                    }}
                  >
                    {item.chosen ? data?.[1] || "Ładowanie..." : item.content}
                  </div>
                ))}
              </div>
            </div>
            <div className="button-rankinggame">
              <MyButton
                message="Confirm"
                color="green"
                onClick={handleSubmit}
                disabled={isLoading}
              />
            </div>
            <div className="placeholder-rankinggame"></div>
          </div>
        </div>
        <div className="chart">
          <MyCustomChart ranks={chartData} />
        </div>
      </div>
    </>
  );
}
