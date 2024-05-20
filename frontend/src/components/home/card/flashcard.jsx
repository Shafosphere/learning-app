import { useEffect, useState } from "react";
import "./flashcard.css";
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
  userWordRef
}) {
  const [word, setWord] = useState("");
  const [wordID, setId] = useState("");
  const [secondWord, setSecondWord] = useState("");
  const [userWord, setUserWord] = useState("");
  const [hint, setHint] = useState(false);
  const wordLength = word.length;

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
      if (event.key === 'ArrowDown') {
        if (document.activeElement === correctWordRef.current) {
          correctSecondWordRef.current.focus();
        } else if (document.activeElement === correctSecondWordRef.current) {
          userWordRef.current.focus();
        }
      } else if (event.key === 'ArrowUp') {

        if (document.activeElement === correctSecondWordRef.current) {
          correctWordRef.current.focus();
        } else if (document.activeElement === userWordRef.current) {
          correctSecondWordRef.current.focus();
        }
      }
    }
  
    window.addEventListener('keydown', handleKeyDown);
  
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [correctSecondWordRef, correctWordRef, userWordRef]);
  
  return (
    <>
      <div className="container-flashcard">
        <div className={`wrong-answer ${showWrongAnswer}`}>
          <span style={{ color: "red" }}>{word}</span>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="top-flashcard">
            <div className={`window-flashcard ${className}`}>
              <div className={`learning ${showWrongAnswer}`}>
                <div className="label-container">
                  <label>{word}</label>
                  <input
                    type="text"
                    style={{ "--wordLength": word.length }}
                    maxLength={wordLength}
                    value={correctWord}
                    onChange={correctWordChange}
                    ref={correctWordRef}
                  />
                </div>
                <div className="label-container">
                  <label>{secondWord}</label>
                  <input
                    type="text"
                    style={{ "--wordLength": secondWord.length }}
                    maxLength={secondWord.length}
                    value={correctSecondWord}
                    onChange={correctSecondWordChange}
                    ref={correctSecondWordRef}
                  />
                </div>
              </div>
              <span>{secondWord}</span>
              <input
                type="text"
                style={{ "--wordLength": wordLength }}
                maxLength={wordLength}
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
        {hint && <div className="flashcard-description">{word[0]}</div>}
      </div>
    </>
  );
}
