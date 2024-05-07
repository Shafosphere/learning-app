import { useEffect, useState } from "react";
import "./flashcard.css";
export default function Flashcard({ data, check, className }) {
  const [plWord, setWord] = useState(data.wordPl.word);
  const [userWord, setUserWord] = useState("");
  const wordLength = plWord.length;
  function handleInputChange(event) {
    setUserWord(event.target.value);
  }
  function handleSubmit(event) {
    event.preventDefault(); // Zapobiega domyślnemu zachowaniu formularza
    check(userWord, plWord);
  }
  useEffect(() => {
    setWord(data.wordPl.word);
    setUserWord("");
  }, [data.wordPl.word]);

  return (
    <>
      <div className="container-flashcard">
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
                className="button"
                style={{ "--buttonColor": "var(--secondary)" }}
              >
                hint
              </button>
            </div>
          </div>
        </form>
        <div className="flashcard-description">{data.wordPl.description}</div>
      </div>
    </>
  );
}
