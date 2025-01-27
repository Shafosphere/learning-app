import "./vocatest.css";
import { useState, useEffect, useMemo } from "react";
import { useIntl, FormattedMessage } from "react-intl";

import api from "../../../utils/api";
import InputField from "../wordInput";
import { addNumberToGood, addNumberToWrong } from "../../../utils/indexedDB";
import Confetti from "../../confetti/confetti";
import ResultsSummary from "../summary/resultssummary";
import MyButton from "../../button/button";
import NewProgressBar from "../../progress_bar/progressbar";

import usePersistedState from "../../../hooks/localstorage/usePersistedState";
import useSpellchecking from "../../../hooks/spellchecking/spellchecking";
import usePageVisit from "../../../hooks/activity/countingentries";

export default function VocaTest({ setDisplay, lvl }) {
  const intl = useIntl();

  const [userWord, setWord] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [generateConfetti, setGenerateConfetti] = useState(false);

  const checkSpelling = useSpellchecking();

  const pageName = `vocabulary_${lvl}`;
  usePageVisit(pageName);

  // Data from the server
  const [data, setData] = useState([]);

  // Patch data
  const [patchNumber, setPatch] = usePersistedState(`currentPatch-${lvl}`, 1);
  const [patchLength, setLength] = usePersistedState(
    `patchLength-${lvl}`,
    null
  );

  // Index for the "bottom-bot" item in the carousel
  const [dataIndexForBottomDiv, setDataIndexForBottomDiv] = usePersistedState(
    `dataIndexForBottomDiv-${lvl}`,
    0
  );

  // Is this the last patch?
  const [isThisLastOne, setLastOne] = usePersistedState(`end-${lvl}`, false);

  // Show summary?
  const [showSummary, setSummary] = usePersistedState(`summary-${lvl}`, false);

  // Carousel state
  const [carouselItems, setCarouselItems] = useState(null);

  // Switch between text-input mode and "know/don't know" button mode
  const [mode, setMode] = useState(true);

  // Count how many words user has already answered in this patch
  const [wordsAnsweredCount, setWordsAnsweredCount] = usePersistedState(
    `wordsAnsweredCount-${lvl}`,
    0
  );

  // ID of the last item in the patch data
  const [lastDataItemId, setLastDataItemId] = useState(() => {
    const savedId = localStorage.getItem(`lastDataItemId-${lvl}`);
    return savedId ? parseInt(savedId) : null;
  });

  // Show local progress or total progress
  const [showPercent, setShowPercent] = useState(false);

  // Calculate percentage of answered words in the current patch
  const percent = useMemo(() => {
    if (data.length > 0) {
      return ((wordsAnsweredCount / data.length) * 100).toFixed(2);
    } else {
      return 0;
    }
  }, [wordsAnsweredCount, data]);

  // Calculate overall percentage of finished patches
  const totalpercent = useMemo(() => {
    if (data.length > 0) {
      return ((patchNumber / patchLength) * 100).toFixed(2);
    } else {
      return 0;
    }
  }, [patchNumber, patchLength, data]);

  // Fetch patch data from the server
  useEffect(() => {
    async function fetchPatchInfo() {
      try {
        const response = await api.get("/word/patch-info");
        // maxPatchId – how many patches total for this level
        const maxPatchId = response.data[`total${lvl}Patches`];
        const lengthPatch = response.data[`length${lvl}patch`];

        // Check if this is the last patch
        setLastOne(patchNumber === maxPatchId);
        // Set patch length
        setLength(lengthPatch);
      } catch (error) {
        console.error(
          intl.formatMessage({
            id: "vocaTest.errorFetchingPatchInfo",
            defaultMessage: "Error fetching patch info:",
          }),
          error
        );
      }
    }

    async function requestPatch(patchNumber) {
      try {
        const response = await api.post("/word/patch-data", {
          level: lvl,
          patchNumber: patchNumber,
        });
        return response.data;
      } catch (error) {
        console.error(
          intl.formatMessage({
            id: "vocaTest.errorFetchingPatch",
            defaultMessage: "Error fetching patch:",
          }),
          error
        );
        throw error;
      }
    }

    async function startGame() {
      if (patchNumber !== null) {
        const gameData = await requestPatch(patchNumber);
        if (gameData && gameData.data && gameData.data.length > 0) {
          setData(gameData.data);
        } else {
          console.log(
            intl.formatMessage({
              id: "vocaTest.noData",
              defaultMessage: "No data.",
            })
          );
        }
      }
    }

    fetchPatchInfo();
    startGame();
  }, [patchNumber, setLastOne, setLength, lvl, intl]);

  function resetProgress(lvl) {
    localStorage.removeItem(`carouselItems-${lvl}`);
    localStorage.removeItem(`lastDataItemId-${lvl}`);
    localStorage.removeItem(`currentPatch-${lvl}`);
    localStorage.removeItem(`patchLength-${lvl}`);
    localStorage.removeItem(`dataIndexForBottomDiv-${lvl}`);
    localStorage.removeItem(`end-${lvl}`);
    localStorage.removeItem(`summary-${lvl}`);
    localStorage.removeItem(`wordsAnsweredCount-${lvl}`);
  
    // Po 2 sekundach odśwież stronę
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  // Show confetti animation
  function confettiShow() {
    setShowConfetti(true);
    setGenerateConfetti(true);

    const generateTimer = setTimeout(() => {
      setGenerateConfetti(false);
    }, 2000);

    // Remove the Confetti component after 3 additional seconds
    const hideTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);

    return () => {
      clearTimeout(generateTimer);
      clearTimeout(hideTimer);
    };
  }

  function nextPatch() {
    const nextPatchNumber = patchNumber + 1;
    localStorage.setItem(`currentPatch-${lvl}`, nextPatchNumber);
    setPatch(nextPatchNumber);
  }

  // Initialize the carousel with data
  useEffect(() => {
    if (data.length > 0 && carouselItems === null) {
      const savedCarouselItems = localStorage.getItem(`carouselItems-${lvl}`);
      if (savedCarouselItems) {
        setCarouselItems(JSON.parse(savedCarouselItems));
      } else {
        setCarouselItems([
          { id: 1, className: "top-bot", data: null },
          { id: 2, className: "top", data: null },
          { id: 3, className: "middle", data: data[0] },
          { id: 4, className: "bottom", data: data[1] },
          { id: 5, className: "bottom-bot", data: data[2] },
        ]);
        setDataIndexForBottomDiv(3);

        const lastId = data[data.length - 1].id;
        localStorage.setItem(`lastDataItemId-${lvl}`, lastId);
        setLastDataItemId(lastId);
      }
    }
  }, [
    data,
    carouselItems,
    lvl,
    setDataIndexForBottomDiv,
    setCarouselItems,
    setLastDataItemId,
  ]);

  function moveCarousel() {
    setCarouselItems((prevItems) => {
      // get classNames
      const classNames = prevItems.map((item) => item.className);

      // rotate classNames
      const lastClassName = classNames[classNames.length - 1];
      const newClassNames = [
        lastClassName,
        ...classNames.slice(0, classNames.length - 1),
      ];

      // update classes
      const newItems = prevItems.map((item, index) => ({
        ...item,
        className: newClassNames[index],
      }));

      return newItems;
    });
  }

  // Update the data in the "bottom-bot" item after carousel moves
  function carouselUpdate() {
    if (data.length > 0) {
      setCarouselItems((prevItems) => {
        const bottomBotIndex = prevItems.findIndex(
          (item) => item.className === "bottom-bot"
        );

        const newItems = prevItems.map((item, index) => {
          if (index === bottomBotIndex) {
            return {
              ...item,
              data: data[dataIndexForBottomDiv],
            };
          }
          return item;
        });

        return newItems;
      });

      setDataIndexForBottomDiv((prevIndex) => {
        // if we are at the end of the patch data, go to the next patch
        if (prevIndex === data.length - 1) {
          nextPatch();
          return 0;
        } else {
          return prevIndex + 1;
        }
      });
    }
  }

  // Check the user's answer (text input mode)
  function checkAnswer() {
    const currentItem = carouselItems?.find(
      (item) => item.className === "middle"
    );

    if (currentItem && currentItem.data && currentItem.data.wordPl) {
      const correctAnswer = currentItem.data.wordPl.word || "";
      const isCorrect = checkSpelling(userWord, correctAnswer);

      handleAnswer(isCorrect);
    } else {
      console.log(
        intl.formatMessage({
          id: "vocaTest.noDataToCompare",
          defaultMessage: "No data to compare!",
        })
      );
    }
  }

  // Handle the user’s answer (common for both modes)
  function handleAnswer(isCorrect) {
    const currentItem = carouselItems?.find(
      (item) => item.className === "middle"
    );

    if (currentItem && currentItem.data) {
      const idOfTheWord = currentItem.data.id || "";

      if (isCorrect) {
        addNumberToGood(idOfTheWord, lvl);
        console.log(
          intl.formatMessage({ id: "vocaTest.logGood", defaultMessage: "good" })
        );
      } else {
        addNumberToWrong(idOfTheWord, lvl);
        console.log(
          intl.formatMessage({
            id: "vocaTest.logWrong",
            defaultMessage: "wrong",
          })
        );
      }

      setWordsAnsweredCount((prevCount) => prevCount + 1);

      // check if user reached the last item
      if (currentItem.data.id === lastDataItemId) {
        setWordsAnsweredCount(0);
        const lastId = data[data.length - 1].id;
        localStorage.setItem(`lastDataItemId-${lvl}`, lastId);
        setLastDataItemId(lastId);

        confettiShow();

        if (isThisLastOne) {
          setSummary(true);
        }
      }

      setWord("");
      moveCarousel();
      carouselUpdate();
    } else {
      console.log(
        intl.formatMessage({
          id: "vocaTest.noDataToProcess",
          defaultMessage: "No data to process!",
        })
      );
    }
  }

  // Button mode: user "knows" the word
  function handleClickKnow() {
    handleAnswer(true);
  }

  // Button mode: user "doesn't know" the word
  function handleClickDontKnow() {
    handleAnswer(false);
  }

  // Controlled input for text answer
  function correctWordChange(event) {
    setWord(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      checkAnswer();
    }
  }

  return (
    <>
      <div className="container-words">
        {showSummary ? (
          <ResultsSummary lvl={lvl} setDisplay={setDisplay} resetProgress={resetProgress}/>
        ) : (
          <>
            <div
              className="return-btn-voca"
              onClick={() => setDisplay("default")}
            >
              <h1>{lvl}</h1>
            </div>

            <div className="window-words">
              <div className="top-words">
                <div className="top-left-words">
                  <div className="bar-and-inputs">
                    <div className="bot-words-mobile">
                      {!showPercent ? (
                        <div className="progressbar-words">
                          <div className="progressbar-words-containter">
                            <NewProgressBar
                              percent={percent}
                              text={intl.formatMessage({
                                id: "vocaTest.localPercent",
                                defaultMessage: "% of this part",
                              })}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="progressbar-words">
                          <div className="progressbar-words-containter">
                            <NewProgressBar
                              percent={totalpercent}
                              text={intl.formatMessage({
                                id: "vocaTest.overallPercent",
                                defaultMessage: "% overall",
                              })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {mode ? (
                      <InputField
                        userWord={userWord}
                        onChange={correctWordChange}
                        onKeyDown={handleKeyDown}
                      />
                    ) : (
                      <div className="buttons-words">
                        <MyButton
                          message={intl.formatMessage({
                            id: "vocaTest.know",
                            defaultMessage: "I know it",
                          })}
                          color="green"
                          onClick={handleClickKnow}
                        />
                        <MyButton
                          message={intl.formatMessage({
                            id: "vocaTest.dontKnow",
                            defaultMessage: "I don't know it",
                          })}
                          color="red"
                          onClick={handleClickDontKnow}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="top-right-words">
                  {carouselItems ? (
                    carouselItems.map((item) => (
                      <div
                        key={item.id}
                        className={`box-words ${item.className}`}
                      >
                        {item.data ? item.data.wordEng.word : ""}
                      </div>
                    ))
                  ) : (
                    <div>
                      <FormattedMessage
                        id="vocaTest.loading"
                        defaultMessage="Loading..."
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bot-words">
                {!showPercent ? (
                  <div className="progressbar-words">
                    <div className="progressbar-words-containter">
                      <NewProgressBar
                        percent={percent}
                        text={intl.formatMessage({
                          id: "vocaTest.localPercentFull",
                          defaultMessage: "% known words from this part",
                        })}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="progressbar-words">
                    <div className="progressbar-words-containter">
                      <NewProgressBar
                        percent={totalpercent}
                        text={intl.formatMessage({
                          id: "vocaTest.overallPercentFull",
                          defaultMessage: "% overall completed",
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Switches for 'mode' and 'showPercent' */}
            <div className="switch-container-words">
              <div>
                <input
                  onChange={() => setMode(!mode)}
                  type="checkbox"
                  id="checkboxInput"
                  checked={mode}
                />
                <label
                  htmlFor="checkboxInput"
                  className="toggleSwitch rounded-left"
                ></label>
              </div>

              <div>
                <input
                  onChange={() => setShowPercent(!showPercent)}
                  type="checkbox"
                  id="checkboxInputPercent"
                />
                <label
                  htmlFor="checkboxInputPercent"
                  className="toggleSwitch rounded-right"
                ></label>
              </div>
            </div>
          </>
        )}

        {showConfetti && <Confetti generateConfetti={generateConfetti} />}
      </div>
    </>
  );
}
