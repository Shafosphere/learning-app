import React, { useState, useEffect, useMemo } from "react";
import "./summary.css";
import TableResults from "./tables";
import Drawer from "./drawer";
import Progressbar from "../../home/bar/bar";
import { getAllMinigameWords } from "../../../utils/indexedDB";
import api from "../../../utils/api";


export default function ResultsSummary() {
  const messages = useMemo(
    () => ["Gratulacje!", "Ukończyłeś wszystkie części! :D", "wyniki"],
    []
  );

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [moveUp, setMoveUp] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [percent, setPercent] = useState(0);

  // Stany przechowujące dane wyników
  const [goodWords, setGoodWords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);

  useEffect(() => {
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
        if (currentMessageIndex === 2) {
          const timeout = setTimeout(() => {
            setMoveUp(true);
          }, 1000);
          return () => clearTimeout(timeout);
        } else {
          const timeout = setTimeout(() => {
            setDisplayedText("");
            setCharIndex(0);
            setCurrentMessageIndex((prev) => prev + 1);
          }, 1000);
          return () => clearTimeout(timeout);
        }
      }
    }
  }, [charIndex, currentMessageIndex, messages]);

  useEffect(() => {
    if (moveUp) {
      const timeout = setTimeout(() => {
        setShowResults(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [moveUp]);

  // Pobieranie danych z bazy i obliczanie procentu
  useEffect(() => {
    async function fetchData() {
      const ids = await getAllMinigameWords();
      if (ids && ids.length > 0) {
        const correct = ids[0].good.length;
        const total = ids[0].good.length + ids[0].wrong.length;
        setPercent(((correct / total) * 100).toFixed(2));

        // Pobieranie danych słów na podstawie IDs
        const goodWordsData = await api.post("/data", {
          wordList: ids[0].good,
        });
        const wrongWordsData = await api.post("/data", {
          wordList: ids[0].wrong,
        });

        setGoodWords(goodWordsData.data.data);
        setWrongWords(wrongWordsData.data.data);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="results-summary">
      {currentMessageIndex < 3 && !moveUp && (
        <div className="typing">{displayedText}</div>
      )}

      {moveUp && (
        <div className="typing move-up">
          {/* {messages[2]} */}
          <div className="progressbar-words">
            <label>{percent} %</label>
            <div className="progressbar-summary">
              <Progressbar procent={percent} barHeight="45rem" />
            </div>
          </div>
        </div>
      )}

      {/* Przekazujemy gotowe dane do TableResults */}
      {showResults && (
        <>
          <TableResults goodWords={goodWords} wrongWords={wrongWords} />

          <Drawer/>
        </>
      )}



      

    </div>
  );
}
