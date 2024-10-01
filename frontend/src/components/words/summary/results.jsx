import "./summary.css";
import React, { useEffect, useState } from "react";
import { getAllMinigameWords } from "../../../utils/indexedDB";
import InfiniteScroll from "react-infinite-scroll-component";
import api from "../../../utils/api";

export default function TableResults() {
  const [dataIDs, setDataIDs] = useState(null);

  const [goodWordsID, setGoodWordsID] = useState([]);
  const [wrongWordsID, setWrongWordsID] = useState([]);

  const [goodWords, setGoodWords] = useState([]);
  const [wrongWords, setWrongWords] = useState([]);

  useEffect(() => {
    async function getData() {
      const ids = await getAllMinigameWords();
      setDataIDs(ids); // Ustaw dane po ich pobraniu
    }
    getData(); // Wywołaj funkcję
  }, []);

  useEffect(() => {
    if (dataIDs && dataIDs.length > 0) {
      setGoodWordsID(dataIDs[0].good || []);
      setWrongWordsID(dataIDs[0].wrong || []);
    }
  }, [dataIDs]);

  useEffect(() => {
    if (goodWordsID && goodWordsID.length > 0) {
      const wordList = goodWordsID;

      async function getData(wordList) {
        // Wysyłanie danych jako obiekt z polem wordList
        const response = await api.post("/data", { wordList });
        setGoodWords(response.data.data); // Uzyskanie właściwych danych z odpowiedzi
      }

      getData(wordList);
    }

    if (wrongWordsID && wrongWordsID.length > 0) {
      const wordList = wrongWordsID;

      async function getData(wordList) {
        // Wysyłanie danych jako obiekt z polem wordList
        const response = await api.post("/data", { wordList });
        setWrongWords(response.data.data); // Uzyskanie właściwych danych z odpowiedzi
      }

      getData(wordList);
    }
  }, [goodWordsID, wrongWordsID]);

  return (
    <div className="results">
      <InfiniteScroll
        dataLength={goodWords.length}
        loader={<h4>Loading...</h4>}
        height={720}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>You have seen it all!</b>
          </p>
        }
        scrollableTarget="scrollableDiv"
      >
        <table>
          <thead>
            <tr>
              <th>PL</th>
              <th>ENG</th>
            </tr>
          </thead>
          <tbody>
            {goodWords.map((goodWords) => (
              <tr key={goodWords.id} id={`word-${goodWords.id}`}>
                <td>{goodWords.wordPl.word}</td>
                <td>{goodWords.wordEng.word}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>

      <InfiniteScroll
        dataLength={wrongWords.length}
        loader={<h4>Loading...</h4>}
        height={720}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>You have seen it all!</b>
          </p>
        }
        scrollableTarget="scrollableDiv"
      >
        <table>
          <thead>
            <tr>
              <th>PL</th>
              <th>ENG</th>
            </tr>
          </thead>
          <tbody>
            {wrongWords.map((wrongWords) => (
              <tr key={wrongWords.id} id={`word-${wrongWords.id}`}>
                <td>{wrongWords.wordPl.word}</td>
                <td>{wrongWords.wordEng.word}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
}
