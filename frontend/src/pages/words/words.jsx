import "./words.css";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import InputField from "../../components/words/wordInput";
import { addNumberToGood, addNumberToWrong } from "../../utils/indexedDB";

export default function Words() {
  const [userWord, setWord] = useState("");

  // Dane z serwera
  const [data, setData] = useState([]);
  const [patchNumber, setPatch] = useState(null);

  // Indeks danych dla bottom-bot
  const [dataIndexForBottomDiv, setDataIndexForBottomDiv] = useState(() => {
    const savedIndex = localStorage.getItem("dataIndexForBottomDiv");
    return savedIndex ? parseInt(savedIndex) : 0;
  });
  
  // Stan karuzeli
  const [carouselItems, setCarouselItems] = useState(() => {
    const savedCarouselItems = localStorage.getItem("carouselItems");
    if (savedCarouselItems) {
      return JSON.parse(savedCarouselItems);
    } else {
      return [
        { id: 1, className: "top-bot", data: null },
        { id: 2, className: "top", data: null },
        { id: 3, className: "middle", data: null },
        { id: 4, className: "bottom", data: null },
        { id: 5, className: "bottom-bot", data: null },
      ];
    }
  });

  useEffect(() => {
    const currentPatch = localStorage.getItem("currentPatch");
    setPatch(currentPatch ? parseInt(currentPatch) : 1);
  }, []);

  useEffect(() => {
    async function startGame() {
      if (patchNumber !== null) {
        // Sprawdzamy, czy patchNumber jest ustawiony
        const gameData = await getData(patchNumber);
        if (gameData && gameData.data && gameData.data.length > 0) {
          setData(gameData.data);
        } else {
          console.log("Brak danych");
        }
      }
    }

    startGame();
  }, [patchNumber]);

  useEffect(() => {
    localStorage.setItem("dataIndexForBottomDiv", dataIndexForBottomDiv);
  }, [dataIndexForBottomDiv]);

  useEffect(() => {
    localStorage.setItem("carouselItems", JSON.stringify(carouselItems));
  }, [carouselItems]);

  function nextPatch() {
    const nextPatchNumber = patchNumber + 1;
    localStorage.setItem("currentPatch", nextPatchNumber);
    setPatch(nextPatchNumber);
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

  function moveCarousel() {
    setCarouselItems((prevItems) => {
      // Pobieramy klasy CSS
      const classNames = prevItems.map((item) => item.className);

      // Rotujemy klasy CSS
      const lastClassName = classNames[classNames.length - 1];
      const newClassNames = [
        lastClassName,
        ...classNames.slice(0, classNames.length - 1),
      ];

      // Aktualizujemy klasy CSS w divach
      const newItems = prevItems.map((item, index) => ({
        ...item,
        className: newClassNames[index],
      }));

      return newItems;
    });
  }

  function carouselUpdate() {
    if (data.length > 0) {
      setCarouselItems((prevItems) => {
        // Znajdujemy diva z klasą 'bottom-bot'
        const bottomBotIndex = prevItems.findIndex(
          (item) => item.className === "bottom-bot"
        );

        // Przypisujemy nowe dane do tego diva
        const newItems = prevItems.map((item, index) => {
          if (index === bottomBotIndex) {
            return {
              ...item,
              data: data[dataIndexForBottomDiv],
            };
          }
          return item;
        });

        return newItems;
      });

      // Aktualizujemy indeks danych
      setDataIndexForBottomDiv((prevIndex) => {
        if (prevIndex === data.length - 1) {
          nextPatch();
          return 0;
        } else {
          return prevIndex + 1;
        }
      });
    }
  }

  function correctWordChange(event) {
    setWord(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      checkAnswer();
      moveCarousel();
      carouselUpdate();
    }
  }

  function checkAnswer() {
    const currentItem = carouselItems.find(
      (item) => item.className === "middle" // Poprawne porównanie klas
    );
  
    if (currentItem && currentItem.data && currentItem.data.wordPl) { // Sprawdzamy, czy currentItem, data i wordPl istnieją
      const correctAnswer = currentItem.data.wordPl.word || "";
      const idOfTheWord = currentItem.data.id || "";
  
      if (userWord.trim().toLowerCase() === correctAnswer.toLowerCase()) {
        addNumberToGood(idOfTheWord);
        console.log("good");
        setWord("");
      } else {
        addNumberToWrong(idOfTheWord);
        console.log("wrong");
        setWord("");
      }
    } else {
      console.log("Brak danych do porównania!");
    }
  }
  
  return (
    <div className="container-words">
      <div className="window-words">
        <div className="top-words">
          <div className="top-left-words">
            <InputField
              userWord={userWord}
              onChange={correctWordChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="top-right-words">
            {carouselItems.map((item) => (
              <div key={item.id} className={`box-words ${item.className}`}>
                {item.data ? item.data.wordEng.word : ""}
              </div>
            ))}
          </div>
        </div>
        <div className="bot-words"></div>
      </div>
    </div>
  );
}
