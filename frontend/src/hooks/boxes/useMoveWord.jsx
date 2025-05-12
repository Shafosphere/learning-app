import { addWord, getAllWords } from "../../utils/indexedDB";

export default function useMoveWord({
  boxes,
  setBoxes,
  activeBox,
  randomWord,
  setRandom,
  lvl,
  confettiShow,
  calculatePercent,
  calculateTotalPercent,
  isLoggedIn,
  sendLearnedWordToServer,
  setAutoSave,
}) {
  const boxOrder = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];

  // Move a word to the next box or reset it to the first box
  async function moveWord(chosenWord, moveToFirst = false) {
    const currentBoxIndex = boxOrder.indexOf(activeBox);
    let nextBox = boxOrder[currentBoxIndex + 1];

    if (moveToFirst) {
      nextBox = "boxOne";
    }
    if (activeBox === "boxOne" && moveToFirst) {
      return;
    }

    // When a word reaches the fifth box and is not reset to the first
    if (activeBox === "boxFive" && !moveToFirst) {
      const newId = randomWord.id;

      let wordIds;
      try {
        wordIds = await getAllWords(lvl);
      } catch (err) {
        console.error(err);
        return;
      }

      // If the word is not already recorded as learned, add it
      if (!wordIds.some((word) => word.id === newId)) {
        await addWord(newId, lvl);
        calculatePercent(lvl);
        calculateTotalPercent(lvl);
        confettiShow();

        if (isLoggedIn) {
          await sendLearnedWordToServer(newId);
        }
      }

      // Remove the word from the fifth box
      setBoxes((prev) => {
        const updatedBoxFive = prev[activeBox].filter(
          (item) =>
            item.wordPl.word !== chosenWord && item.wordEng.word !== chosenWord
        );

        if (updatedBoxFive.length === 0) {
          setRandom(null);
        }

        return { ...prev, [activeBox]: updatedBoxFive };
      });
    }

    // Move the word to the next box or reset it to the first box
    if (moveToFirst || currentBoxIndex < boxOrder.length - 1) {
      const matchingWord = boxes[activeBox].filter(
        (item) =>
          item.wordPl.word === chosenWord || item.wordEng.word === chosenWord
      );

      setBoxes((prev) => {
        const updatedCurrent = prev[activeBox].filter(
          (item) =>
            item.wordPl.word !== chosenWord && item.wordEng.word !== chosenWord
        );
        const updatedNext = [...prev[nextBox], ...matchingWord];

        return {
          ...prev,
          [activeBox]: updatedCurrent,
          [nextBox]: updatedNext,
        };
      });
    }

    setAutoSave(true);
  }

  return { moveWord };
}
