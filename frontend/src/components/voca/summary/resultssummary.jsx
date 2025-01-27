import React, { useState, useEffect, useMemo } from "react";
import { useIntl } from "react-intl"; // Importujemy hook
import "./summary.css";
import TableResults from "./tables";
import NewProgressBar from "../../progress_bar/progressbar";
import { getAllMinigameWords } from "../../../utils/indexedDB";
import api from "../../../utils/api";
import SmallButtons from "./smallbuttons";
import Loading from "../../loading/loading";
import { useWindowWidth } from "../../../hooks/window_width/windowWidth";

export default function ResultsSummary({ lvl, setDisplay, resetProgress }) {
  const intl = useIntl();
  const windowWidth = useWindowWidth();

  const isMobileRange = windowWidth <= 479; // poniżej 480
  const isTabletRange = windowWidth >= 480 && windowWidth <= 768; // od 480 do 768
  const isSmallScreen = windowWidth >= 769 && windowWidth <= 1450; // od 769 do 1450
  const isBigScreen = windowWidth > 1450; // powyżej 1450

  // Zamiast stałej tablicy – wywołujemy `intl.formatMessage`:
  const messages = useMemo(
    () => [
      intl.formatMessage({
        id: "summary.congrats",
        defaultMessage: "Gratulacje!",
      }),
      intl.formatMessage({
        id: "summary.finishedAllParts",
        defaultMessage: "Ukończyłeś wszystkie części! :D",
      }),
      intl.formatMessage({ id: "summary.results", defaultMessage: "wyniki" }),
    ],
    [intl]
  );

  const [skipLoad, setSkipLoad] = useState(() => {
    const savedValue = localStorage.getItem("skipLoad-words");
    return savedValue === "false"; //zmień na true, jeśli chcesz pominąć
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

  // Efekt pisania tekstu
  useEffect(() => {
    if (skipLoad) return;

    if (currentMessageIndex < messages.length) {
      const currentString = messages[currentMessageIndex];
      if (charIndex < currentString.length) {
        const timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + currentString[charIndex]);
          setCharIndex((prev) => prev + 1);
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        // Po zakończeniu pisania danego stringa
        const timeout = setTimeout(() => {
          setDisplayedText("");
          setCharIndex(0);
          setCurrentMessageIndex((prev) => prev + 1);

          // Jeśli wyświetliliśmy już trzecią wiadomość (index = 2),
          // to pokazujemy wyniki i wyłączamy tryb pisania
          if (currentMessageIndex === 2) {
            setShowResults(true);
            setSkipLoad(false);
          }
        }, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [charIndex, currentMessageIndex, messages, skipLoad]);

  // Jeżeli pominęliśmy typing:
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

      setLoadingData(false);
    }

    fetchData();
  }, [lvl]);

  return (
    <>
      <div
        className="return-btn-voca summary-return-btn"
        onClick={() => setDisplay("default")}
      >
        <h1>{lvl}</h1>
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
                    <SmallButtons
                      setResults={setResults}
                      resetProgress={resetProgress}
                      lvl={lvl}
                    />
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
