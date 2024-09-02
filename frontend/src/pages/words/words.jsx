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
  // const [tempLastFour, setTempLastFour] = useState(null);

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
      console.log("Middle div found:", middleDiv.id); // Logs the ID of the current middle div
      middleRef.current = middleDiv; // Store the current middle div in the ref
    }

  };

  useEffect(() => {
    console.log('startGame')
    async function startGame() {
      const gameData = await getData();
      if (gameData && gameData.data && gameData.data.length > 0) {
        setData(gameData.data);
        setnextWordIndex(2);
        setLoading(false);
      } else {
        console.log("Brak danych");
        setLoading(false); // Ustaw loading na false nawet w przypadku braku danych
      }
    }
    startGame();
  }, []);

  // useEffect(() => {
  //   if (!loading && data.length > 0) {

  //     function updateDivs() {
  //       const div3 = document.getElementById("3");
  //       const div4 = document.getElementById("4");
  //       const div5 = document.getElementById("5");

  //       if (div3) {
  //         div3.textContent = data[0].wordEng.word;
  //         div3.dataset.id = data[0].id;
  //         div3.dataset.translate = data[0].wordPl.word;
  //       }
  //       if (div4) {
  //         div4.textContent = data[1].wordEng.word;
  //         div4.dataset.id = data[1].id;
  //         div4.dataset.translate = data[1].wordPl.word;
  //       }
  //       if (div5) {
  //         div5.textContent = data[2].wordEng.word;
  //         div5.dataset.id = data[2].id;
  //         div5.dataset.translate = data[2].wordPl.word;
  //       }
  //       setLoading(false);
  //     }

  //     updateDivs();
  //   }
  // }, [loading, data]);

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
      //jesli istnieją dane
      if (data && data.length > 0) {
        //pobierz srodkowy div
        const middleDiv = document.querySelector(".middle");
        //jesli słowo wpisane równe jest poprawnej odpowiedzi
        if (currentWord === middleDiv.dataset.translate) {
          addNumberToGood(middleDiv.dataset.id);
        } else {
          //w przeciwnym wypadku
          addNumberToWrong(middleDiv.dataset.id);
        }

        //znajdz dolnego diva
        const bottomBotDiv = document.querySelector(".bottom-bot");
        if (bottomBotDiv) {
          //jezeli znalazłes to zaktualizuj jego dane
          bottomBotDiv.textContent = data[nextWordIndex].wordEng.word;
          bottomBotDiv.dataset.id = data[nextWordIndex].id;
          bottomBotDiv.dataset.translate = data[nextWordIndex].wordPl.word;
        }


        setnextWordIndex((prevIndex) => {
          // pobierz aktualna wartosc nextWordIndex
          // jezeli nextWordIndex jest ostatnie
          //pobierz nowe dane
          if (prevIndex >= data.length - 1) {
            console.log('reset');
            
            // async function reset() {
            //   const gameData = await getData();
            //   if (gameData && gameData.data && gameData.data.length > 0) {
            //     setData(gameData.data);
            //   } 
            // }

            //zapisuje nowe dane w data
            // reset();
            //ustawia index na 0
            return 0;
          } else {
            //ustawia index na kolejny
            if(prevIndex + 1 >= data.length - 1 ){
              async function reset() {
                const gameData = await getData();
                if (gameData && gameData.data && gameData.data.length > 0) {
                  setData(gameData.data);
                } 
              }
              //zapisuje nowe dane w data
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
          {data && data[nextWordIndex] && <span>{random()}</span>}
        </div>
      </div>
    </div>
  );
}

// notatka na jutro:
// po usunieciu use efect z loading i data nie aktuyalizuje juz automatycznie divów
// ale: nie wyswietla 2 pierwszych (tołatwe, wystarczy dac na 0)
// nie pokazuje ostatnich wartosci