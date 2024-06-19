import { useEffect, useState } from "react";
import "./flashcard.css";
import { FormattedMessage } from 'react-intl';

export default function Flashcard({
  data,
  check,
  className,
  showWrongAnswer,
  activeBox,
  handleSetWordFlash,
  handleSetwordId,
  changeCorrectStatus,
  correctWordRef,
  correctSecondWordRef,
  userWordRef,
}) {
  const [word, setWord] = useState("");
  const [wordID, setId] = useState("");
  const [secondWord, setSecondWord] = useState("");
  const [userWord, setUserWord] = useState("");
  const [hint, setHint] = useState(false);

  const [correctWord, setCorWord] = useState("");
  const [correctSecondWord, setCorSecWord] = useState("");

  function correctWordChange(event) {
    const newCorrectWord = event.target.value;
    setCorWord(newCorrectWord);
    miniCheck(newCorrectWord, correctSecondWord);
  }

  function correctSecondWordChange(event) {
    const newCorrectSecondWord = event.target.value;
    setCorSecWord(newCorrectSecondWord);
    miniCheck(correctWord, newCorrectSecondWord);
  }

  function miniCheck(currentCorrectWord, currentCorrectSecondWord) {
    if (
      currentCorrectWord === word &&
      currentCorrectSecondWord === secondWord &&
      word.length >= 1
    ) {
      changeCorrectStatus();
      setCorWord("");
      setCorSecWord("");
    }
  }

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

  function calculateAdjustedLength(word) {
    const adjustments = {
      i: 0.5,
      l: 0.5,
      m: 1.5,
      w: 1.5,
      r: 0.5,
      t: 0.5,
      f: 0.5,
      j: 0.5,
    };
    return word.split("").reduce((acc, char) => {
      return acc + (adjustments[char] || 1);
    }, 0);
  }

  useEffect(() => {
    if (activeBox === "boxTwo" || activeBox === "boxFour") {
      setWord(data.wordEng.word);
      handleSetWordFlash(data.wordEng.word);
      setSecondWord(data.wordPl.word);
      setId(data.id);
      handleSetwordId(data.id);
    } else {
      setId(data.id);
      handleSetwordId(data.id);
      setWord(data.wordPl.word);
      handleSetWordFlash(data.wordPl.word);
      setSecondWord(data.wordEng.word);
    }
    setUserWord("");
    setHint(false);
  }, [
    activeBox,
    data.wordEng.word,
    data.wordPl.word,
    data.id,
    handleSetWordFlash,
    handleSetwordId,
  ]);

  useEffect(() => {
    if (userWordRef.current) {
      userWordRef.current.focus();
    }
  }, [userWordRef]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "ArrowDown") {
        if (document.activeElement === correctWordRef.current) {
          correctSecondWordRef.current.focus();
        } else if (document.activeElement === correctSecondWordRef.current) {
          userWordRef.current.focus();
        }
      } else if (event.key === "ArrowUp") {
        if (document.activeElement === correctSecondWordRef.current) {
          correctWordRef.current.focus();
        } else if (document.activeElement === userWordRef.current) {
          correctSecondWordRef.current.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [correctSecondWordRef, correctWordRef, userWordRef]);

  return (
    <>
      <div className="container-flashcard">
        <div className={`wrong-answer ${showWrongAnswer}`}>
          <span style={{ color: "red" }}>{word}&#8203;</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="top-flashcard">
            <div className={`window-flashcard ${className}`}>
              <div className={`learning ${showWrongAnswer}`}>
                <div className="label-container">
                  <label>{word}</label>
                  <input
                    className="flashcard-input"
                    type="text"
                    style={{ "--wordLength": calculateAdjustedLength(word) }}
                    maxLength={word.length}
                    value={correctWord}
                    onChange={correctWordChange}
                    ref={correctWordRef}
                  />
                </div>
                <div className="label-container">
                  <label>{secondWord}</label>
                  <input
                    className="flashcard-input"
                    type="text"
                    style={{
                      "--wordLength": calculateAdjustedLength(secondWord),
                    }}
                    maxLength={secondWord.length}
                    value={correctSecondWord}
                    onChange={correctSecondWordChange}
                    ref={correctSecondWordRef}
                  />
                </div>
              </div>
              <span>{secondWord}</span>
              <input
                className="flashcard-input"
                type="text"
                style={{ "--wordLength": calculateAdjustedLength(word) }}
                maxLength={word.length}
                value={userWord}
                onChange={handleInputChange}
                ref={userWordRef}
              />
            </div>

            <div className="button-container">
              <button
                onClick={() => check(userWord, word, wordID)}
                className="button"
                type="submit"
                style={{ "--buttonColor": "var(--highlight)" }}
              >
                <FormattedMessage id="submit" />
              </button>
              <button
                onClick={() => showLetter()}
                className="button"
                type="button"
                style={{ "--buttonColor": "var(--secondary)" }}
              >
                <FormattedMessage id="firstLetter" />
              </button>
            </div>
          </div>
        </form>
        <div className="flashcard-description">{data.wordPl.description}</div>
        {hint && <div className="flashcard-description">{word[0]}</div>}
      </div>
    </>
  );
}
