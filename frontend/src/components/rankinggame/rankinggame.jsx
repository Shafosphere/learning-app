import { useEffect, useState, useRef, useCallback } from "react";
import "./rankinggmae.css";
import MyButton from "../button/button";
import api from "../../utils/api";
import MyCustomChart from "./chart";

export default function RankingGameContent() {
  const [data, setData] = useState([]);
  const [userWord, setUserWord] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [correctTranslations, setCorrectTranslations] = useState([]);
  const [lastAnswerStatus, setLastAnswerStatus] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [currentPoints, setCurrentPoints] = useState(1000);
  const inputRef = useRef(null);
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
      await fetchNewWord(); // Dodane
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      inputRef.current?.focus();
    }
  }, [data]);

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

      const response = await api.post("/word/submit-answer", {
        wordId: data[0],
        userAnswer: userWord,
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
    <div className="rankinggmae-container">
      {correctTranslations.length > 0 && (
        <div
          className={`answer-feedback ${
            lastAnswerStatus ? "correct" : "incorrect"
          }`}
        >
          <h3>{lastAnswerStatus ? "Poprawnie!" : "Błąd!"}</h3>
          <p>Poprawne tłumaczenia:</p>
          <ul>
            {correctTranslations.map((t, index) => (
              <li key={index}>
                {t.language.toUpperCase()}: {t.translation}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rankinggmae-window">
        <div className="rankinggame-left">
          <input
            value={userWord}
            onKeyDown={handleKeyDown}
            onChange={(e) => setUserWord(e.target.value)}
            className="rankinggame-input"
            disabled={isLoading}
            ref={inputRef}
          />

          <div className="rankinggmae-button">
            <MyButton
              message="Confirm"
              color="green"
              onClick={handleSubmit}
              disabled={isLoading}
            />
          </div>
        </div>

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

      <MyCustomChart ranks={chartData} />
    </div>
  );
}
