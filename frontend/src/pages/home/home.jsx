import "./home.css";
import Flashcard from "../../components/home/card/flashcard";
import Boxes from "../../components/home/box/box";

import { data } from "../../data/data";
import { useEffect, useState, useRef } from "react";
export default function Home() {
  let wordNumber = 20;
  const [wordsData] = useState(() => data.slice(0, wordNumber));
  const [randomWord, setRandom] = useState("");
  const [className, setClass] = useState("");
  const [showWrongAnswer, setShowWrongAnswer] = useState('not-visible');

  const [boxes, setBoxes] = useState({
    boxOne: "0",
    boxTwo: "0",
    boxThree: "0",
    boxFour: "0",
    boxFive: "0"
  });
  const [activeBox, setActiveBox] = useState('boxOne');

  function selectRandomWord() {
    const randomIndex = Math.floor(Math.random() * wordsData.length);
    setRandom(wordsData[randomIndex]);
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
      setShowWrongAnswer('visible');
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setClass("");
        selectRandomWord();
        setShowWrongAnswer('not-visible');
      }, 3000);
    }
  }

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    selectRandomWord();
  }, []);

  return (
    <div className="container-home">
        {randomWord && (
          <Flashcard
            data={randomWord}
            check={check}
            className={className}
            showWrongAnswer={showWrongAnswer}
          />
        )}
      <Boxes
        boxes={boxes}
        activeBox={activeBox}
        setActiveBox={setActiveBox}
      />
    </div>
  );
}
