import "./words.css";
import api from "../../utils/api";
import { useEffect, useRef, useState } from "react";
import { addNumberToGood, addNumberToWrong } from "../../utils/indexedDB";

export default function Words() {
  const [currentWord, setWord] = useState("");
  const [data, setData] = useState([]);
  const [nextWordIndex, setnextWordIndex] = useState(0);
  const middleRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const [carousel, setCarousel] = useState({
    1: "top-bot",
    2: "top",
    3: "middle",
    4: "bottom",
    5: "bottom-bot",
  });

  const handleClick = () => {
    let newCarousel = { ...carousel };

    newCarousel[2] = carousel[1];
    newCarousel[3] = carousel[2];
    newCarousel[4] = carousel[3];
    newCarousel[5] = carousel[4];
    newCarousel[1] = carousel[5];

    setCarousel(newCarousel);
  };

  useEffect(() => {
    async function startGame() {
      const gameData = await getData();
      if (gameData && gameData.data && gameData.data.length > 0) {
        setData(gameData.data);
        setnextWordIndex(3);
        setLoading(false);
      } else {
        console.log("Brak danych");
        setLoading(false); // Ustaw loading na false nawet w przypadku braku danych
      }
    }
    startGame();
  }, []);

  useEffect(() => {
    if (!loading && data.length > 0) {
      // Sprawdź czy loading jest false i dane są dostępne
      function updateDivs() {
        const div3 = document.getElementById("3");
        const div4 = document.getElementById("4");
        const div5 = document.getElementById("5");
  
        if (div3) {
          div3.textContent = data[0].wordEng.word;
          div3.dataset.id = data[0].id; // Ustaw atrybut data-id
          div3.dataset.translate = data[0].wordPl.word; // Ustaw atrybut data-translate
        }
        if (div4) {
          div4.textContent = data[1].wordEng.word;
          div4.dataset.id = data[1].id; // Ustaw atrybut data-id
          div4.dataset.translate = data[1].wordPl.word; // Ustaw atrybut data-translate
        }
        if (div5) {
          div5.textContent = data[2].wordEng.word;
          div5.dataset.id = data[2].id; // Ustaw atrybut data-id
          div5.dataset.translate = data[2].wordPl.word; // Ustaw atrybut data-translate
        }
      }
      updateDivs(); // Wywołaj updateDivs tylko raz, kiedy loading zmieni się na false
    }
  }, [loading, data]); // Obserwuj loading i data, aby updateDivs wykonało się raz po załadowaniu danych

  useEffect(() => {
    // Whenever carousel changes, update the reference to the middle div
    const middleDiv = document.querySelector(".middle");
    if (middleDiv) {
      console.log("Middle div found:", middleDiv.id); // Logs the ID of the current middle div
      middleRef.current = middleDiv; // Store the current middle div in the ref
    }
  }, [carousel]);

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

  function correctWordChange(event) {
    setWord(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      if (data && data.length > 0) {
        const middleDiv = document.querySelector(".middle");
        if (currentWord === middleDiv.dataset.translate) {
          addNumberToGood(middleDiv.dataset.id);
        } else {
          addNumberToWrong(middleDiv.dataset.id);
        }
        const bottomBotDiv = document.querySelector(".bottom-bot");
        if (bottomBotDiv) {
          bottomBotDiv.textContent = data[nextWordIndex].wordEng.word;
          bottomBotDiv.dataset.id = data[nextWordIndex].id; // Użyj dataset dla spójności
          bottomBotDiv.dataset.translate = data[nextWordIndex].wordPl.word; // Użyj dataset dla spójności
        }
        setnextWordIndex((prevIndex) =>
          Math.min(prevIndex + 1, data.length - 1)
        );
  
        handleClick();
      } else {
        console.log("Źle");
      }
    }
  }
  
  function random() {
    const middleDiv = document.querySelector(".middle");
    const output = middleDiv.dataset.translate;
    return output;
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
            <div id={1} className={`box-words ${carousel[1]} `}></div>
            <div id={2} className={`box-words ${carousel[2]} `}></div>
            <div id={3} className={`box-words ${carousel[3]} `}></div>
            <div id={4} className={`box-words ${carousel[4]} `}></div>
            <div id={5} className={`box-words ${carousel[5]} `}></div>
          </div>
        </div>
        <div className="bot-words">
          {data && data[nextWordIndex] && (
            <span>{random()}</span>
          )}
        </div>
      </div>
    </div>
  );
}
