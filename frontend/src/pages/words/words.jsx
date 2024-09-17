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
  const [nextWordIndex, setnextWordIndex] = useState(2);
  const [loading, setLoading] = useState(true);

  //percent calc
  const [maxium, setMaxium] = useState(100);
  const [percent, setPercent] = useState(0);
  const [secondPercent, setSecondPercent] = useState(0);

  const mounted = useRef(false);
  const [carousel, setCarousel] = useState({
    1: "top-bot",
    2: "top",
    3: "middle",
    4: "bottom",
    5: "bottom-bot",
  });

  function handleClick() {
    setCarousel((prevCarousel) => ({
      1: prevCarousel[5],
      2: prevCarousel[1],
      3: prevCarousel[2],
      4: prevCarousel[3],
      5: prevCarousel[4],
    }));
  }

  useEffect(() => {
    if (data.length > 0) {
      const calculatedPercent = ((nextWordIndex / data.length) * 100).toFixed(2);
      setSecondPercent(calculatedPercent);
    }
  }, [nextWordIndex, data]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      async function startGame() {
        const currentPatch = await getPatchNumber(); // Funkcja do pobrania numeru aktualnego patcha z local storage
        const gameData = await getData(currentPatch);
        if (gameData && gameData.data && gameData.data.length > 0) {
          setData(gameData.data);
        } else {
          console.log("Brak danych");
        }
      }

      async function maximum() {
        try {
          const response = await api.get("/pre-data");
          const maxWordId = response.data.maxWordId;
          setMaxium(maxWordId);
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

  function updateDivs() {
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
  }

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
    } else {
      console.log("Brak danych w minigameWords.");
    }
  }

  function correctWordChange(event) {
    setWord(event.target.value);
  }

  function handleKeyDown(event) {
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

      const patchNumber = getPatchNumber();
      setnextWordIndex((prevIndex) => {
        if (prevIndex >= data.length - 1) {
          newData(); // Call newData when at the last element
          markPatchAsCompleted(patchNumber);
          return 0; // Reset index to 0
        } else {
          return prevIndex + 1; // Otherwise, simply increment the index
        }
      });

      setWord("");
      handleClick();
    }
  }

  async function newData() {
    const patchNumber = getPatchNumber();
    const gameData = await getData(patchNumber);
    if (gameData && gameData.data && gameData.data.length > 0) {
      setData(gameData.data);
    }
  }

  function getPatchNumber() {
    const currentPatch = localStorage.getItem("currentPatch");
    return currentPatch ? parseInt(currentPatch) : 1;
  }

  function updatePatchNumber(newPatchNumber) {
    localStorage.setItem("currentPatch", newPatchNumber);
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
          {/* <button
            className="button"
            type="button"
            style={{ "--buttonColor": "var(--tertiary)" }}
          >
            {nextWordIndex - 2}
          </button> */}

          <div className="progressbar-words">
            <label>current series {secondPercent} %</label>
            <div className="progressbar-words-containter">
              <Progressbar procent={secondPercent} barHeight="60rem" />
            </div>
          </div>

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
