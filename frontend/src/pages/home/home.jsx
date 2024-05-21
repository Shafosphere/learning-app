import "./home.css";
import axios from "axios";
import Flashcard from "../../components/home/card/flashcard";
import EmptyFlashcard from "../../components/home/card/empty-flashcard";
import Boxes from "../../components/home/box/box";
import dingSound from "../../data/ding.wav"
import dongSound from "../../data/dong.wav"

import { useEffect, useState, useRef, useCallback } from "react";
export default function Home() {
  const [randomWord, setRandom] = useState(null); //selected word
  const [className, setClass] = useState(""); //class display
  const [showWrongAnswer, setShowWrongAnswer] = useState("not-visible");
  const [activeBox, setActiveBox] = useState("boxOne"); //clicked box
  const timeoutRef = useRef(null);
  const [boxes, setBoxes] = useState({
    //boxes
    boxOne: [],
    boxTwo: [],
    boxThree: [],
    boxFour: [],
    boxFive: [],
  });
  const wordFlashcardRef = useRef(null);
  const idFlashcardRef = useRef(null);

  //focus managment
  const userWordRef = useRef(null);
  const correctWordRef = useRef(null);
  const correctSecondWordRef = useRef(null);

  //sound
  const dingSoundRef = useRef(new Audio(dingSound));
  const dongSoundRef = useRef(new Audio(dongSound));

  function check(userWord, word, id) {
    if (userWord === word) {
      setClass("correct");
      clearTimeout(timeoutRef.current);
      dingSoundRef.current.play();
      timeoutRef.current = setTimeout(() => {
        setClass("");
        moveWord(id, word, false);
        selectRandomWord(activeBox);
      }, 1500);
    } else {
      setClass("notcorrect");
      setShowWrongAnswer("visible");
      correctWordRef.current.focus();
      dongSoundRef.current.play();
    }
  }

  const handleSetWordFlash = useCallback((item) => {
    wordFlashcardRef.current = item;
  }, []);

  const handleSetwordId = useCallback((item) => {
    idFlashcardRef.current = item;
  }, []);

  function changeCorrectStatus() {
    setClass("");
    moveWord(idFlashcardRef.current, wordFlashcardRef.current, true);
    selectRandomWord(activeBox);
    setShowWrongAnswer("not-visible");
    userWordRef.current.focus();
  }

  function handleSetBox(item) {
    selectRandomWord(item);
    setActiveBox(item);
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
      if (activeBox === "boxOne") {
        selectRandomWord(activeBox);
      }
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
      return response; // Return the response object
    } catch (error) {
      console.error("Data error:", error);
      throw error; // Rethrow the error to be caught by the caller
    }
  }

  function brunWords() {
    console.log(boxes[activeBox][1].id);
  }

  function selectRandomWord(item) {
    setBoxes((prevBoxes) => {
      const boxLength = prevBoxes[item].length;
      let randomIndex = 0;
      if (boxLength > 1) {
        let newIndex;
        do {
          newIndex = Math.floor(Math.random() * boxLength);
        } while (randomWord && prevBoxes[item][newIndex].id === randomWord.id);
        randomIndex = newIndex;
      }
      const newRandomWord = prevBoxes[item][randomIndex];
      setRandom(newRandomWord);
      return prevBoxes;
    });
  }

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

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
          correctWordRef={correctWordRef}
          correctSecondWordRef={correctSecondWordRef}
          userWordRef={userWordRef}
        />
      ) : (
        <EmptyFlashcard />
      )}
      <Boxes
        boxes={boxes}
        activeBox={activeBox}
        handleSetBox={handleSetBox}
        addWords={addWords}
        brunWords={brunWords}
      />
    </div>
  );
}
