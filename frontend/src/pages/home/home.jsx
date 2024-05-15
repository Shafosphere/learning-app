import "./home.css";
import axios from "axios";
import Flashcard from "../../components/home/card/flashcard";
import EmptyFlashcard from "../../components/home/card/empty-flashcard";
import Boxes from "../../components/home/box/box";

import { useEffect, useState, useRef, useCallback } from "react";
export default function Home() {
  const [randomWord, setRandom] = useState(""); //selected word
  const [className, setClass] = useState(""); //class display
  const [showWrongAnswer, setShowWrongAnswer] = useState("not-visible");
  const [activeBox, setActiveBox] = useState("boxOne"); //clicked box
  const timeoutRef = useRef(null);
  const [boxes, setBoxes] = useState({ //boxes
    boxOne: [],
    boxTwo: [],
    boxThree: [],
    boxFour: [],
    boxFive: [],
  });
  const [isCorrect, setIsCorrect] = useState(false);
  const [word_flashcard, setwordFlash] = useState();
  const [id_flashcard, setwordId] = useState();

  function check(userWord, word, id) {
    if (userWord === word) {
      setClass("correct");
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setClass("");
        selectRandomWord();
        moveWord(id, word, false);
      }, 3000);
    } else {
      setClass("notcorrect");
      setShowWrongAnswer("visible");
    }
  }

  function handleSetWordFlash(item){
    setwordFlash(item);
  };

  function handleSetwordId(item){
    setwordId(item);
  };

  function changeCorrectStatus(){
    setIsCorrect(true);
  }

  function moveWord(id, chosen_word, moveToFirst = false) {
    const boxOrder = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];
    const currentBoxIndex = boxOrder.indexOf(activeBox);
    let nextBox = boxOrder[currentBoxIndex + 1];

    if (moveToFirst) {
      nextBox = "boxOne";
    }
    if (activeBox === "boxOne" && moveToFirst) {
      return;
    }
    if (activeBox === "boxFive" && !moveToFirst) {
      const newid = randomWord.id;
      let wordIds = JSON.parse(localStorage.getItem("wordIds")) || [];
      if (!wordIds.includes(newid)) {
        wordIds.push(newid);
        // console.log(wordIds);
        // console.log(newid);
        localStorage.setItem("wordIds", JSON.stringify(wordIds));
      }

      setBoxes((prevBoxes) => {
        const updatedBoxFive = prevBoxes[activeBox].filter(
          (obiekt) =>
            obiekt.wordPl.word !== chosen_word &&
            obiekt.wordEng.word !== chosen_word
        );
        return {
          ...prevBoxes,
          [activeBox]: updatedBoxFive,
        };
      });
      return;
    }

    if (moveToFirst || currentBoxIndex < boxOrder.length - 1) {
      const find_word = boxes[activeBox].filter(
        (obiekt) =>
          obiekt.wordPl.word === chosen_word ||
          obiekt.wordEng.word === chosen_word
      );

      setBoxes((prevBoxes) => {
        const updatedCurrentBox = prevBoxes[activeBox].filter(
          (obiekt) =>
            obiekt.wordPl.word !== chosen_word &&
            obiekt.wordEng.word !== chosen_word
        );

        const updatedNextBox = [...prevBoxes[nextBox], ...find_word];

        return {
          ...prevBoxes,
          [activeBox]: updatedCurrentBox,
          [nextBox]: updatedNextBox,
        };
      });
    }
  }

  async function addWords() {
    try {
      const response = await getData(); // Wait for the data to be fetched
      const newData = response.data.data; // Assuming the data is in response.data.data
      setBoxes((prevBoxes) => ({
        ...prevBoxes,
        boxOne: [...prevBoxes.boxOne, ...newData], // Spread the newData into the array
      }));
    } catch (error) {
      console.error("Error adding words:", error);
    }
  }

  async function getData() {
    const boxOrder = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];
    let words_used = [];
    boxOrder.forEach((item) => {
      boxes[item].forEach((second_item) => {
        words_used.push(second_item.id);
      });
    });
    
  
    const storedWordIds = localStorage.getItem("wordIds");
    try {
      const wordIds = storedWordIds ? JSON.parse(storedWordIds) : [];
      const response = await axios.post(
        "http://localhost:8080/data",
        { wordIds, words_used },
        { withCredentials: true }
      );
      console.log(response.data.data);
      return response; // Return the response object
    } catch (error) {
      console.error("Data error:", error);
      throw error; // Rethrow the error to be caught by the caller
    }
  }

  function brunWords() {
    console.log(boxes[activeBox][1].id);
  }

  const selectRandomWord = useCallback(() => {
  let randomIndex;
  if (boxes[activeBox].length > 1) {
    do {
      randomIndex = Math.floor(Math.random() * boxes[activeBox].length);
    } while (randomWord && (boxes[activeBox][randomIndex].id === randomWord.id));
    setRandom(boxes[activeBox][randomIndex]);
  } else if (boxes[activeBox].length === 1) {
    setRandom(boxes[activeBox][0]);
  } else {
    const randomIndex = Math.floor(Math.random() * boxes[activeBox].length);
    setRandom(boxes[activeBox][randomIndex]);
  }
}, [boxes, activeBox, randomWord]);

  useEffect(() => {
    selectRandomWord();
    // console.log(randomWord);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [activeBox, boxes]);
  
  useEffect(() => {
    if (isCorrect) {
      setClass("");
      selectRandomWord();
      moveWord(id_flashcard, word_flashcard, false);
      setShowWrongAnswer("not-visible");
      setIsCorrect(false);
    }
  }, [isCorrect]);

  return (
    <div className="container-home">
      {randomWord ? (
        <Flashcard
          data={randomWord}
          check={check}
          className={className}
          showWrongAnswer={showWrongAnswer}
          activeBox={activeBox}
          handleSetWordFlash={handleSetWordFlash}
          handleSetwordId={handleSetwordId}
          changeCorrectStatus={changeCorrectStatus}
        />
      ) : (
        <EmptyFlashcard />
      )}
      <Boxes
        boxes={boxes}
        activeBox={activeBox}
        setActiveBox={setActiveBox}
        addWords={addWords}
        brunWords={brunWords}
      />
    </div>
  );
}
