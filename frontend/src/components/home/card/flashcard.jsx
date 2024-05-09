import { useEffect, useState } from "react";
import "./flashcard.css";
export default function Flashcard({ data, check, className, showWrongAnswer }) {
  const [plWord, setWord] = useState(data.wordPl.word);
  const [userWord, setUserWord] = useState("");
  const [hint, setHint] = useState(false);

  const wordLength = plWord.length;

  function handleInputChange(event) {
    setUserWord(event.target.value);
  }
  function handleSubmit(event) {
    event.preventDefault();
    check(userWord, plWord);
  }
  function showLetter() {
    setHint(true);
  }

  useEffect(() => {
    setWord(data.wordPl.word);
    setUserWord("");
    setHint(false);
  }, [data.wordPl.word]);
  
  return (
    <>
      <div className="container-flashcard">
        <div className={`wrong-answer ${showWrongAnswer}`}>
          <span style={{ color: "red" }}> {data.wordPl.word}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="top-flashcard">
            <div className={`window-flashcard ${className}`}>
              <span>{data.wordEng.word}</span>
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
                onClick={() => check(userWord, plWord)}
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
            First letter: {data.wordPl.word[0]}
          </div>
        )}
      </div>
    </>
  );
}
