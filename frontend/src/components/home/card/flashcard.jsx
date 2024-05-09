import { useEffect, useState } from "react";
import "./flashcard.css";
export default function Flashcard({ data, check, className, showWrongAnswer, activeBox }) {
  const [word, setWord] = useState('');
  const [secondWord, setSecondWord] = useState('');
  const [userWord, setUserWord] = useState("");
  const [hint, setHint] = useState(false);
  const wordLength = word.length;

  function handleInputChange(event) {
    setUserWord(event.target.value);
  }
  function handleSubmit(event) {
    event.preventDefault();
    check(userWord, word);
  }
  function showLetter() {
    setHint(true);
  }

  useEffect(() => {
    if (activeBox === 'boxTwo' || activeBox === 'boxFour') {
      setWord(data.wordEng.word);
      setSecondWord(data.wordPl.word);
    } else {
      setWord(data.wordPl.word);
      setSecondWord(data.wordEng.word)
    }
    setUserWord("");
    setHint(false);
  }, [activeBox, data.wordEng.word, data.wordPl.word]);
  
  return (
    <>
      <div className="container-flashcard">
        <div className={`wrong-answer ${showWrongAnswer}`}>
          <span style={{ color: "red" }}> {word}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="top-flashcard">
            <div className={`window-flashcard ${className}`}>
              <span>{secondWord}</span>
              <input
                type="text"
                style={{ "--wordLength": wordLength }}
                maxLength={wordLength}
                value={userWord}
                onChange={handleInputChange}
              />
            </div>

            <div className="button-container">
              <button
                onClick={() => check(userWord, word)}
                className="button"
                type="submit"
                style={{ "--buttonColor": "var(--highlight)" }}
              >
                submit
              </button>
              <button
                onClick={() => showLetter()}
                className="button"
                type="button"
                style={{ "--buttonColor": "var(--secondary)" }}
              >
                first letter
              </button>
            </div>
          </div>
        </form>
        <div className="flashcard-description">{data.wordPl.description}</div>
        {hint && (
          <div className="flashcard-description">
            {data.wordPl.word[0]}
          </div>
        )}
      </div>
    </>
  );
}
