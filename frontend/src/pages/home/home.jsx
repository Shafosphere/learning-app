import "./home.css";
import Flashcard from "../../components/home/card/flashcard";
import EmptyFlashcard from "../../components/home/card/empty-flashcard";
import Boxes from "../../components/home/box/box";

import { data } from "../../data/data";
import { useEffect, useState, useRef } from "react";
export default function Home() {
  const [randomWord, setRandom] = useState("");
  const [className, setClass] = useState("");
  const [showWrongAnswer, setShowWrongAnswer] = useState("not-visible");
  const [activeBox, setActiveBox] = useState("boxOne");

  const [boxes, setBoxes] = useState({
    boxOne: [],
    boxTwo: [],
    boxThree: [],
    boxFour: [],
    boxFive: [],
  });

  function addWords() {
    function getRandomElements(arr, num) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    }

    const newWords = getRandomElements(data, 20);
    setBoxes((prevBoxes) => ({
      ...prevBoxes,
      boxOne: [...prevBoxes.boxOne, ...newWords],
    }));
  }

  function selectRandomWord() {
    const randomIndex = Math.floor(Math.random() * boxes[activeBox].length);
    setRandom(boxes[activeBox][randomIndex]);
  }

  const timeoutRef = useRef(null);

  function check(userWord, word) {
    if (userWord === word) {
      setClass("correct");
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setClass("");
        selectRandomWord();
      }, 3000);
    } else {
      setClass("notcorrect");
      setShowWrongAnswer("visible");
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setClass("");
        selectRandomWord();
        setShowWrongAnswer("not-visible");
      }, 3000);
    }
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    selectRandomWord();
    console.log(randomWord);
  }, [activeBox, boxes]);

  return (
    <div className="container-home">
      {randomWord ? (
        <Flashcard
          data={randomWord}
          check={check}
          className={className}
          showWrongAnswer={showWrongAnswer}
        />
      ) : (
        <EmptyFlashcard />
      )}
      <Boxes
        boxes={boxes}
        activeBox={activeBox}
        setActiveBox={setActiveBox}
        addWords={addWords}
      />
    </div>
  );
}
