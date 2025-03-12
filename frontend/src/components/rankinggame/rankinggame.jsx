import { useEffect, useState } from "react";
import "./rankinggmae.css";
import MyButton from "../button/button";
import api from "../../utils/api";

export default function RankingGameContent() {
  const [data, setData] = useState([]);
  const [userWord, setUserWord] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(false);
  const [correctTranslations, setCorrectTranslations] = useState([]);
  const [lastAnswerStatus, setLastAnswerStatus] = useState(null);
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

      // Aktualizuj UI na podstawie odpowiedzi
      if (response.data.success) {
        setCorrectTranslations(response.data.correctTranslations);
        setLastAnswerStatus(response.data.isCorrect);
        setUserWord("");
        shuffle();
        fetchNewWord();
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

  function shuffle() {
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
  }

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
        <input
          value={userWord}
          onKeyDown={handleKeyDown}
          onChange={(e) => setUserWord(e.target.value)}
          className="rankinggame-input"
          disabled={isLoading}
        />
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
      <div className="rankinggmae-button">
        <MyButton message="Confrim" color="green" onClick={shuffle} />
      </div>
    </div>
  );
}
