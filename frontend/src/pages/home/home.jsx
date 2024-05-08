import "./home.css";
import Flashcard from "../../components/home/card/flashcard";
import { data } from "../../data/data";
import { useEffect, useState } from "react";
export default function Home() {
  let wordNumber = 20;
  const [wordsData, setWord] = useState(data.slice(0, wordNumber));
  const [randomWord, setRandom] = useState("");
  const [className, setClass] = useState("");
  const [showWrongAnswer, setShowWrongAnswer] = useState('not-visible');

  function selectRandomWord() {
    const randomIndex = Math.floor(Math.random() * wordsData.length);
    setRandom(wordsData[randomIndex]);
  }

  function check(userWord, word) {
    if (userWord === word) {
      setClass("correct");
      setTimeout(() => {
        setClass("");
        selectRandomWord();
      }, 3000);
    } else {
      setClass("notcorrect");
      setShowWrongAnswer('visible');
      setTimeout(() => {
        setClass("");
        selectRandomWord();
        setShowWrongAnswer('not-visible');
      }, 3000);
    }
  }

  useEffect(() => {
    selectRandomWord();
  }, []);

  return (
    <div className="container-home">
      <div className="window-home">
        {randomWord && (
          <Flashcard
            data={randomWord}
            check={check}
            className={className}
            showWrongAnswer={showWrongAnswer}
          />
        )}
      </div>
    </div>
  );
}
