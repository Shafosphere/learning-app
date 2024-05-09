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

  function moveToNextBox(chosen_word) {
    const boxOrder = ['boxOne', 'boxTwo', 'boxThree', 'boxFour', 'boxFive'];
    const currentBoxIndex = boxOrder.indexOf(activeBox);
  
    if (currentBoxIndex < boxOrder.length - 1) {
      const nextBox = boxOrder[currentBoxIndex + 1];
      const find_word = boxes[activeBox].filter(obiekt =>
        obiekt.wordPl.word === chosen_word || obiekt.wordEng.word === chosen_word
      );
  
      setBoxes((prevBoxes) => {
        const updatedCurrentBox = prevBoxes[activeBox].filter(obiekt =>
          obiekt.wordPl.word !== chosen_word && obiekt.wordEng.word !== chosen_word
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

  function brunWords(){
    console.log(randomWord);
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
        moveToNextBox(word);
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
          activeBox={activeBox}
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
