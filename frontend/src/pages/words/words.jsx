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
  const mounted = useRef(false);
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

    const middleDiv = document.querySelector(".middle");
    if (middleDiv) {
      middleRef.current = middleDiv;
    }

  };

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      async function startGame() {
        const gameData = await getData();
        if (gameData && gameData.data && gameData.data.length > 0) {
          console.log("set nowe dane");
          setData(gameData.data);
          setnextWordIndex(2);
        } else {
          console.log("Brak danych");
        }
      }
      startGame();
    }
  }, []);

  useEffect(() => {
    if (loading === true && data.length > 0) {

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
        setLoading(false);
      }

      updateDivs();
    }
  }, [loading, data]);

  async function getData() {
    console.log('getdata')
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

  //enter
  function handleKeyDown(event) {
    console.log('enter')
    if (event.key === "Enter") {
      if (data && data.length > 0) {
        console.log('pobieram srodek')
        const middleDiv = document.querySelector(".middle");
        if (currentWord === middleDiv.dataset.translate) {
          console.log('dodaje do dobrych')
          addNumberToGood(middleDiv.dataset.id);
        } else {
          console.log('dodaje do złych ' + middleDiv.dataset.id)
          addNumberToWrong(middleDiv.dataset.id);
        }

        const bottomBotDiv = document.querySelector(".bottom-bot");
        if (bottomBotDiv) {
          bottomBotDiv.textContent = data[nextWordIndex].wordEng.word;
          bottomBotDiv.dataset.id = data[nextWordIndex].id;
          bottomBotDiv.dataset.translate = data[nextWordIndex].wordPl.word;
        }


        setnextWordIndex((prevIndex) => {
          if (prevIndex >= data.length - 1) {
            console.log('reset');
            return 0;
          } else {
            if(prevIndex + 1 >= data.length - 1 ){
              async function reset() {
                const gameData = await getData();
                if (gameData && gameData.data && gameData.data.length > 0) {
                  setData(gameData.data);
                } 
              }
              reset();
            }
            return prevIndex + 1;
          }

        });
        

        setWord("");
      } else {
        console.log("Źle");
      }
      handleClick();
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
          {/* {data && data[nextWordIndex] && <span>{random()}</span>} */}
        </div>
      </div>
    </div>
  );
}