import React, { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import LearingInput from "./custominput/custominput";
import MyButton from "../../button/button";

// Component for practicing individual flashcards
export default function Flashcard({
  data,
  check,
  className,
  cssClasses,
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

  // State for manual correction inputs
  const [correctWord, setCorWord] = useState("");
  const [correctSecondWord, setCorSecWord] = useState("");

  // Handle manual correct word change and run mini-check
  function correctWordChange(event) {
    const newCorrectWord = event.target.value;
    setCorWord(newCorrectWord);
    miniCheck(newCorrectWord, correctSecondWord);
  }

  // Handle manual correct second word change and run mini-check
  function correctSecondWordChange(event) {
    const newCorrectSecondWord = event.target.value;
    setCorSecWord(newCorrectSecondWord);
    miniCheck(correctWord, newCorrectSecondWord);
  }

  // If both manual inputs match the target words, trigger correct status update
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

  // Track user input change
  function handleInputChange(event) {
    setUserWord(event.target.value);
  }

  // Submit user answer for checking
  function handleSubmit(event) {
    event.preventDefault();
    check(userWord, word);
  }

  // Show first letter as hint
  function showLetter() {
    setHint(true);
  }

  // Adjust visual length calculation for variable character widths
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

  // Initialize flashcard content when data or activeBox changes
  useEffect(() => {
    const eng = data.wordEng.word;
    const pl = data.wordPl.word;
    setId(data.id);
    handleSetwordId(data.id);

    if (activeBox === "boxTwo" || activeBox === "boxFour") {
      setWord(eng);
      handleSetWordFlash(eng);
      setSecondWord(pl);
    } else {
      setWord(pl);
      handleSetWordFlash(pl);
      setSecondWord(eng);
    }

    setUserWord("");
    setHint(false);
  }, [activeBox, data, handleSetWordFlash, handleSetwordId]);

  // Focus the user input when the ref changes
  useEffect(() => {
    userWordRef.current?.focus();
  }, [userWordRef]);

  // On style change showing manual inputs, focus the first manual input
  useEffect(() => {
    if (cssClasses.notVisible === "visible") {
      setTimeout(() => {
        correctWordRef.current?.focus();
      }, 50);
    }
  }, [cssClasses.notVisible]);

  // Navigate between inputs with arrow keys
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
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [correctSecondWordRef, correctWordRef, userWordRef]);

  // Handle Enter key to submit answer
  function handleKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      check(userWord, word, wordID);
    }
  }

  return (
    <div className="container-flashcard">
      <div className={`wrong-answer ${cssClasses.notVisible}`}>  
        <span style={{ color: "red" }}>{word}&#8203;</span>
      </div>
      <form className="form-flashcard" onSubmit={handleSubmit}>
        <div className="top-flashcard">
          <div className={`window-flashcard ${className}`}>  
            <div className={`learning ${cssClasses.notDisplay}`}>  
              <LearingInput
                placeholder={word}
                maxLength={word.length}
                value={correctWord}
                correctWordChange={correctWordChange}
                correctWordRef={correctWordRef}
                autoFocus={cssClasses.notVisible === "visible"}
              />
              <span className="solid-border-flashcard"></span>
              <LearingInput
                placeholder={secondWord}
                maxLength={secondWord.length}
                value={correctSecondWord}
                correctWordChange={correctSecondWordChange}
                correctWordRef={correctSecondWordRef}
              />
            </div>
            <div className={`valuesuser-flashcard ${cssClasses.notDisplayReverse}`}>  
              <span>{secondWord}</span>
              <input
                className="flashcard-input flashcard-input-normal"
                type="text"
                style={{ "--wordLength": calculateAdjustedLength(word) }}
                maxLength={word.length}
                value={userWord}
                onChange={handleInputChange}
                ref={userWordRef}
                autoCapitalize="off"
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          <div className="button-container">
            <MyButton
              message={<FormattedMessage id="submit" defaultMessage="Submit" />}  
              color="green"
              onClick={() => check(userWord, word, wordID)}
            />
            <MyButton
              message={<FormattedMessage id="firstLetter" defaultMessage="First Letter" />}  
              color="red"
              onClick={showLetter}
            />
          </div>
        </div>
      </form>
      <div className="flashcard-description">{data.wordPl.description}</div>
      {hint && <div className="hint">{word[0]}</div>}
    </div>
  );
}
