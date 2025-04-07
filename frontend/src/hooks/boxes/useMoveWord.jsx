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

  async function moveWord(chosenWord, moveToFirst = false) {
    const currentBoxIndex = boxOrder.indexOf(activeBox);
    let nextBox = boxOrder[currentBoxIndex + 1];

    if (moveToFirst) {
      nextBox = "boxOne";
    }
    if (activeBox === "boxOne" && moveToFirst) {
      return;
    }

    // Gdy słowo trafia do piątego boxa i nie jest cofane do pierwszego
    if (activeBox === "boxFive" && !moveToFirst) {
      const newid = randomWord.id;

      let wordIds;
      try {
        wordIds = await getAllWords(lvl);
      } catch (err) {
        console.error(err);
        return; 
      }

      if (!wordIds.some((word) => word.id === newid)) {
        await addWord(newid, lvl);
        calculatePercent(lvl);
        calculateTotalPercent(lvl);
        confettiShow();

        if (isLoggedIn) {
          await sendLearnedWordToServer(newid);
        }
      }

      setBoxes((prevBoxes) => {
        const updatedBoxFive = prevBoxes[activeBox].filter(
          (obiekt) =>
            obiekt.wordPl.word !== chosenWord &&
            obiekt.wordEng.word !== chosenWord
        );

        if (updatedBoxFive.length === 0) {
          setRandom(null);
        }

        return {
          ...prevBoxes,
          [activeBox]: updatedBoxFive,
        };
      });
    }

    // Przeniesienie do nextBox lub cofnięcie do boxOne
    if (moveToFirst || currentBoxIndex < boxOrder.length - 1) {
      const find_word = boxes[activeBox].filter(
        (obiekt) =>
          obiekt.wordPl.word === chosenWord ||
          obiekt.wordEng.word === chosenWord
      );

      setBoxes((prevBoxes) => {
        const updatedCurrentBox = prevBoxes[activeBox].filter(
          (obiekt) =>
            obiekt.wordPl.word !== chosenWord &&
            obiekt.wordEng.word !== chosenWord
        );

        const updatedNextBox = [...prevBoxes[nextBox], ...find_word];

        return {
          ...prevBoxes,
          [activeBox]: updatedCurrentBox,
          [nextBox]: updatedNextBox,
        };
      });
    }

    setAutoSave(true);
  }

  return { moveWord };
}
