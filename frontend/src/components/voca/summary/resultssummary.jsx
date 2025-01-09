import React, { useState, useEffect, useMemo } from "react";
import "./summary.css";
import TableResults from "./tables";
import NewProgressBar from "../../progress_bar/progressbar";
// import Progressbar from "../../home/bar/bar";
import { getAllMinigameWords } from "../../../utils/indexedDB";
import api from "../../../utils/api";
import SmallButtons from "./smallbuttons";
import Loading from "../../loading/loading";
import { useWindowWidth } from "../../window_width/windowWidth";
import Drawer from "./drawer";

export default function ResultsSummary({ lvl, setDisplay }) {
  const windowWidth = useWindowWidth();

  const isMobileRange = windowWidth <= 479; // poniżej 480
  const isTabletRange = windowWidth >= 480 && windowWidth <= 768; // od 480 do 768
  const isSmallScreen = windowWidth >= 769 && windowWidth <= 1450; // od 769 do 1450
  const isBigScreen = windowWidth > 1450; // powyżej 1450

  const messages = useMemo(
    () => ["Gratulacje!", "Ukończyłeś wszystkie części! :D", "wyniki"],
    []
  );

  const [skipLoad, setSkipLoad] = useState(() => {
    const savedValue = localStorage.getItem("skipLoad-words");
    return savedValue === "true";
  });

  useEffect(() => {
    localStorage.setItem("skipLoad-words", skipLoad);
  }, [skipLoad]);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [percent, setPercent] = useState(0);
  const [displayedResults, setResults] = useState("good");

  // Stany przechowujące dane wyników
  const [goodWords, setGoodWords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);

  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (skipLoad) return;

    if (currentMessageIndex < messages.length) {
      if (charIndex < messages[currentMessageIndex].length) {
        const timeout = setTimeout(() => {
          setDisplayedText(
            (prev) => prev + messages[currentMessageIndex][charIndex]
          );
          setCharIndex((prev) => prev + 1);
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayedText("");
          setCharIndex(0);
          setCurrentMessageIndex((prev) => prev + 1);
          if (currentMessageIndex === 2) {
            setShowResults(true);
            setSkipLoad(false);
          }
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [charIndex, currentMessageIndex, messages, skipLoad]);

  useEffect(() => {
    if (skipLoad) {
      setShowResults(true);
    }
  }, [skipLoad]);

  // Pobieranie danych z bazy i obliczanie procentu
  useEffect(() => {
    async function fetchData() {
      const ids = await getAllMinigameWords(lvl);

      if (ids && ids.good && ids.wrong) {
        const correct = ids.good.length;
        const total = ids.good.length + ids.wrong.length;
        setPercent(((correct / total) * 100).toFixed(2));

        const goodWordsData = await api.post("/word/data", {
          wordList: ids.good,
        });
        const wrongWordsData = await api.post("/word/data", {
          wordList: ids.wrong,
        });

        setGoodWords(goodWordsData.data.data);
        setWrongWords(wrongWordsData.data.data);
      }

      setLoadingData(false); // Set loadingData to false after fetching
    }

    fetchData();
  }, [lvl]);

  return (
    <>
      <div
        className="return-btn-voca summary-return-btn"
        onClick={() => setDisplay("default")}
      >
        <h1> {lvl} </h1>
      </div>
      <div className="results-summary">
        {loadingData ? (
          <Loading />
        ) : (
          <>
            {currentMessageIndex < 3 && (
              <div className="typing">{displayedText}</div>
            )}

            {showResults && (
              <>
                {isMobileRange && (
                  <>
                    {displayedResults === "good" && (
                      <TableResults goodWords={goodWords} wrongWords={[]} />
                    )}

                    {displayedResults === "wrong" && (
                      <TableResults goodWords={[]} wrongWords={wrongWords} />
                    )}

                    {/* {displayedResults === "percent" && (
                  <NewProgressBar percent={percent} text={`${percent} %`} />
                )} */}

                    {/* <Drawer /> */}
                    <SmallButtons setResults={setResults} />
                  </>
                )}

                {isTabletRange && (
                  <>
                    <div className="summaryProgressbar">
                      <NewProgressBar percent={percent} text={`${percent} %`} />
                    </div>
                    {displayedResults === "good" && (
                      <TableResults goodWords={goodWords} wrongWords={[]} />
                    )}

                    {displayedResults === "wrong" && (
                      <TableResults goodWords={[]} wrongWords={wrongWords} />
                    )}
                    <SmallButtons setResults={setResults} />
                    {/* <Drawer /> */}
                  </>
                )}

                {isSmallScreen && (
                  <>
                    <div className="summaryProgressbar">
                      <NewProgressBar percent={percent} text={`${percent} %`} />
                    </div>
                    <TableResults
                      goodWords={goodWords}
                      wrongWords={wrongWords}
                    />
                  </>
                )}

                {isBigScreen && (
                  <>
                    <div className="summaryProgressbar">
                      <NewProgressBar percent={percent} text={`${percent} %`} />
                    </div>
                    <TableResults
                      goodWords={goodWords}
                      wrongWords={wrongWords}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
