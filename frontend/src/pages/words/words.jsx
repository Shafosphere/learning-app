import "./words.css";
import api from "../../utils/api";
import { useEffect, useRef, useState } from "react";
import {
  addNumberToGood,
  addNumberToWrong,
  getAllMinigameWords,
} from "../../utils/indexedDB";
import Carousel from "../../components/words/carousel";
import InputField from "../../components/words/wordInput";
import Progressbar from "../../components/home/bar/bar";

export default function Words() {
  const [currentWord, setWord] = useState("");
  const [data, setData] = useState([]);
  const [nextWordIndex, setnextWordIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [patch, setPatch] = useState([]);
  //percent calc
  const [maxium, setMaxium] = useState(100);
  const [percent, setPercent] = useState(0);

  const mounted = useRef(false);
  const [carousel, setCarousel] = useState({
    1: "top-bot",
    2: "top",
    3: "middle",
    4: "bottom",
    5: "bottom-bot",
  });

  const handleClick = () => {
    setCarousel((prevCarousel) => ({
      1: prevCarousel[5],
      2: prevCarousel[1],
      3: prevCarousel[2],
      4: prevCarousel[3],
      5: prevCarousel[4],
    }));
  };

  // useEffect(() => {
  //   if (!mounted.current) {
  //     mounted.current = true;

  //     async function startGame() {
  //       const gameData = await getData();
  //       if (gameData && gameData.data && gameData.data.length > 0) {
  //         setData(gameData.data);
  //         setnextWordIndex(2);
  //       } else {
  //         console.log("Brak danych");
  //       }
  //     }
  //     startGame();
  //   }
  // }, []);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      async function startGame() {
        const currentPatch = await getPatchNumber(); // Funkcja do pobrania numeru aktualnego patcha z local storage
        const gameData = await getData(currentPatch);
        if (gameData && gameData.data && gameData.data.length > 0) {
          setData(gameData.data);
          setnextWordIndex(2);
        } else {
          console.log("Brak danych");
        }
      }

      async function maximum() {
        try {
          const response = await api.get("/pre-data");
          const maxWordId = response.data.maxWordId;
          setMaxium(maxWordId)
        } catch (error) {
          console.error("Błąd podczas pobierania danych:", error);
          return null;
        }
      }


      startGame();
      maximum();

    }
  }, []);

  useEffect(() => {
    if (loading && data.length > 0) {
      updateDivs();
      setLoading(false);
      calcPercent();
    }
  }, [loading, data]);

  const updateDivs = () => {
    const div3 = document.getElementById("3");
    const div4 = document.getElementById("4");

    if (div3) {
      div3.textContent = data[0].wordEng.word;
      div3.dataset.id = data[0].id;
      div3.dataset.translate = data[0].wordPl.word;
    }
    if (div4) {
      div4.textContent = data[1].wordEng.word;
      div4.dataset.id = data[1].id;
      div4.dataset.translate = data[1].wordPl.word;
    }
  };

  // async function getData() {
  //   try {
  //     const response = await api.get("/pre-data");
  //     const minWordId = response.data.minWordId;
  //     const maxWordId = response.data.maxWordId;
  //     setMaxium(maxWordId);
  //     const wordList = Array.from(
  //       { length: 20 },
  //       () =>
  //         Math.floor(Math.random() * (maxWordId - minWordId + 1)) + minWordId
  //     );

  //     const dataResponse = await api.post("/data", { wordList });
  //     return dataResponse.data;
  //   } catch (error) {
  //     console.error("Błąd podczas pobierania danych:", error);
  //     return null;
  //   }
  // }

  async function getData(patchNumber) {
    try {
      const dataResponse = await api.post("/data", { patchNumber });
      return dataResponse.data;
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
      return null;
    }
  }

  async function calcPercent() {
    const minigameWords = await getAllMinigameWords();
    if (minigameWords.length > 0) {
      const goodCount = minigameWords[0].good.length;
      const wrongCount = minigameWords[0].wrong.length;
      const total = (((goodCount + wrongCount) * 100) / maxium).toFixed(2);
      setPercent(total);

      setPercent(total);
    } else {
      console.log("Brak danych w minigameWords.");
    }
  }

  const correctWordChange = (event) => setWord(event.target.value);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && data.length > 0) {
      const middleDiv = document.querySelector(".middle");
      if (currentWord === middleDiv.dataset.translate) {
        addNumberToGood(middleDiv.dataset.id);
        calcPercent();
      } else {
        addNumberToWrong(middleDiv.dataset.id);
        calcPercent();
      }

      const bottomBotDiv = document.querySelector(".bottom-bot");
      if (bottomBotDiv) {
        bottomBotDiv.textContent = data[nextWordIndex].wordEng.word;
        bottomBotDiv.dataset.id = data[nextWordIndex].id;
        bottomBotDiv.dataset.translate = data[nextWordIndex].wordPl.word;
      }

      setnextWordIndex((prevIndex) => {
        if (prevIndex >= data.length - 1) {
          return 0;
        } else {
          if (prevIndex + 1 >= data.length - 1) {
            resetGameData();
          }
          return prevIndex + 1;
        }
      });

      setWord("");
      handleClick();
    }
  };

  const resetGameData = async () => {
    const gameData = await getData();
    if (gameData && gameData.data && gameData.data.length > 0) {
      setData(gameData.data);
    }
  };

  function getPatchNumber() {
    const currentPatch = localStorage.getItem("currentPatch");
    return currentPatch ? parseInt(currentPatch) : 1;
  }

  function updatePatchNumber(newPatchNumber) {
    localStorage.setItem("currentPatch", newPatchNumber);
  }

  async function clicked() {
    const patchNumber = 1;
    try {
      const dataResponse = await api.post("/data", { patchNumber });
      if (dataResponse) {
        setPatch(dataResponse.data.data); // Tylko tablica danych
      }
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
    }
  }

  function markPatchAsCompleted(currentPatch) {
    const completedPatches =
      JSON.parse(localStorage.getItem("completedPatches")) || [];
    if (!completedPatches.includes(currentPatch)) {
      completedPatches.push(currentPatch);
      localStorage.setItem(
        "completedPatches",
        JSON.stringify(completedPatches)
      );
    }
    updatePatchNumber(currentPatch + 1); // Przejście do następnego patcha
  }

  return (
    <div className="container-words">
      <div className="window-words">
        <div className="top-words">
          <div className="top-left-words">
            <InputField
              currentWord={currentWord}
              onChange={correctWordChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="top-right-words">
            <Carousel carousel={carousel} />
          </div>
        </div>
        <div className="bot-words">
          <button
            onClick={() => clicked()}
            className="button"
            type="button"
            style={{ "--buttonColor": "var(--tertiary)" }}
          >
            test
          </button>

          <div className="progressbar-words">
            <label>Progress {percent} %</label>
            <div className="progressbar-words-containter">
              <Progressbar procent={percent} barHeight="60rem" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
