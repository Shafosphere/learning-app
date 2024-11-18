import React, { useState, useEffect, useMemo } from "react";
import "./summary.css";
import TableResults from "./tables";
import Drawer from "./drawer";
import Progressbar from "../../home/bar/bar";
import { getAllMinigameWords } from "../../../utils/indexedDB";
import api from "../../../utils/api";

import Loading from "../../loading/loading";


export default function ResultsSummary({lvl}) {
  const messages = useMemo(
    () => ["Gratulacje!", "Ukończyłeś wszystkie części! :D", "wyniki"],
    []
  );

  const [skipLoad, setSkipLoad] = useState(() => {
    const savedValue = localStorage.getItem("skipLoad-words");
    return savedValue === "true"; 
  })
 
  useEffect(() => {
    localStorage.setItem("skipLoad-words", skipLoad)
  }, [skipLoad])

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [moveUp, setMoveUp] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [percent, setPercent] = useState(0);

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
  }, [charIndex, currentMessageIndex, messages, skipLoad]);

  useEffect(() => {
    if (moveUp) {
      const timeout = setTimeout(() => {
        setShowResults(true);
        setSkipLoad(true);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [moveUp]);

  useEffect(() => {
    if (skipLoad) {
      setMoveUp(true);
      setShowResults(true);
    }
  }, [skipLoad]);
  

  // Pobieranie danych z bazy i obliczanie procentu
  useEffect(() => {
    async function fetchData() {
      console.log('pobieram dane')
      const ids = await getAllMinigameWords(lvl);
      console.log(ids)
      if (ids && ids.good && ids.wrong) {
        console.log("ids:", ids);
        const correct = ids.good.length;
        const total = ids.good.length + ids.wrong.length;
        setPercent(((correct / total) * 100).toFixed(2));
      
        // Fetch words data based on IDs
        console.log('test');
        const goodWordsData = await api.post("/word/data", {
          wordList: ids.good,
        });
        const wrongWordsData = await api.post("/word/data", {
          wordList: ids.wrong,
        });
      
        console.log("good " + goodWordsData.data.data);
        setGoodWords(goodWordsData.data.data);
        setWrongWords(wrongWordsData.data.data);
      }
      
      setLoadingData(false); // Set loadingData to false after fetching
    }
  
    fetchData();
  }, [lvl]);
  

  return (
    <div className="results-summary">
      {loadingData ? (
        <Loading />
      ) : (
        <>
          {currentMessageIndex < 3 && !moveUp && (
            <div className="typing">{displayedText}</div>
          )}
  
          {moveUp && (
            <div className="typing move-up">
              <div className="progressbar-words">
                <label>{percent} %</label>
                <div className="progressbar-summary">
                  <Progressbar procent={percent} barHeight="45rem" />
                </div>
              </div>
            </div>
          )}
  
          {showResults && (
            <>
              <TableResults goodWords={goodWords} wrongWords={wrongWords} />
              <Drawer />
            </>
          )}
        </>
      )}
    </div>
  );
}
