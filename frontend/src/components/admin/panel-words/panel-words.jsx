import "./panel-words.css";
import api from "../../../utils/api";
import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import WordDetail from "./word-details";
export default function WordsPanel() {
  const [words, setWords] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeWord, setActiveWord] = useState(null);

  async function getWords(page) {
    try {
      console.log(`Fetching words for page: ${page}`);
      const response = await api.get(`/words?page=${page}&limit=50`);
      console.log(`Received response for page: ${page}`, response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching words:", error);
      return [];
    }
  }

  useEffect(() => {
    const loadInitialWords = async () => {
      const initialWords = await getWords(1);
      setWords(initialWords);
      setPage(1);
      setHasMore(initialWords.length > 0);
    };

    loadInitialWords();
  }, []);

  async function getMoreWords() {
    console.log("getMoreWords");
    const newPage = page + 1;
    const newWords = await getWords(newPage);
    if (newWords.length > 0) {
      setWords((prevWords) => [...prevWords, ...newWords]);
      setPage(newPage);
    }
    setHasMore(newWords.length > 0);
    console.log(`Updated page to: ${newPage}, hasMore: ${newWords.length > 0}`);
  }

  return (
    <>
      <div className="words-container">
        <div className="words-table">
          <InfiniteScroll
            dataLength={words.length}
            next={getMoreWords}
            hasMore={hasMore}
            loader={<h4>Loading...</h4>}
            height={800}
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
                  <th>id</th>
                  <th>word</th>
                </tr>
              </thead>
              <tbody>
                {words.map((word) => (
                  <tr key={word.id} onClick={() => setActiveWord(word.id)}>
                    <td>{word.id}</td>
                    <td>{word.word}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div>
      <WordDetail activeWord={activeWord}/>
    </>
  );
}
