import "./words.css";
import api from "../../utils/api";
import { useEffect, useState } from "react";
import Card from "./card";

export default function Words() {
  const [currentWord, setWord] = useState("");
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [carousel, setCarousel] = useState({
    1: "top-bot",
    2: "top",
    3: "middle",
    4: "bottom",
    5: "bottom-bot"
  });

  const handleClick = () => {
    let newCarousel = { ...carousel };

    // newCarousel[1] = carousel[3];
    // newCarousel[2] = carousel[1];
    // newCarousel[3] = carousel[2];

    newCarousel[2] = carousel[1];
    newCarousel[3] = carousel[2];
    newCarousel[4] = carousel[3];
    newCarousel[5] = carousel[4];
    newCarousel[1] = carousel[5];

      setCarousel(newCarousel);
  };

  useEffect(() => {
    setWord("");
  }, []);

  async function getData() {
    let maxWordId;
    let minWordId;

    try {
      const response = await api.get("/pre-data");
      minWordId = response.data.minWordId;
      maxWordId = response.data.maxWordId;
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
      return null;
    }

    const wordList = [];
    for (let i = 0; i < 20; i++) {
      const randomWordId =
        Math.floor(Math.random() * (maxWordId - minWordId + 1)) + minWordId;
      wordList.push(randomWordId);
    }

    try {
      const response = await api.post("/data", { wordList });
      return response.data;
    } catch (error) {
      console.error("Błąd podczas pobierania słów:", error);
      return null;
    }
  }

  async function startGame() {
    const gameData = await getData();
    if (gameData && gameData.data && gameData.data.length > 0) {
      setData(gameData.data);
      setCurrentIndex(0); // Zaczynamy od pierwszego słowa
    } else {
      console.log("Brak danych");
    }
  }

  function correctWordChange(event) {
    setWord(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      if (
        data &&
        data.length > 0 &&
        currentWord === data[currentIndex].wordPl.word
      ) {
        console.log("Dobrze");
        setWord(""); // Wyczyść input
        setCurrentIndex((prevIndex) =>
          Math.min(prevIndex + 1, data.length - 1)
        ); // Przesuń do następnego słowa
      } else {
        console.log("Źle");
      }
    }
  }

  return (
    <div className="container-words">
      <div className="window-words">
        <div className="top-words">
          <div className="top-left-words">
            <input
              type="text"
              value={currentWord}
              onChange={correctWordChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="top-right-words">
            <div
              id={1}
              className={`box ${carousel[1]} `}
            >
              Div 1
            </div>
            <div
              id={2}
              className={`box ${carousel[2]} `}
            >
              Div 2
            </div>
            <div
              id={3}
              className={`box ${carousel[3]} `}
            >
              Div 3
            </div>
            <div
              id={4}
              className={`box ${carousel[4]} `}
            >
              Div 4
            </div>
            <div
              id={5}
              className={`box ${carousel[5]} `}
            >
              Div 5
            </div>
          </div>
        </div>
        <div className="bot-words">
          <button
            // onClick={startGame}
            onClick={handleClick}
            className="button"
            type="button"
            style={{ "--buttonColor": "var(--tertiary)" }}
          >
            Start
          </button>
          {data && data[currentIndex] && (
            <span>{data[currentIndex].wordPl.word}</span>
          )}
        </div>
      </div>
    </div>
  );
}
