import "./panel-words.css";
import api from "../../../utils/api";
import React, { useState, useEffect } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { FaSearch } from "react-icons/fa";

import WordDetail from "./word-details";
export default function WordsPanel() {
  const [words, setWords] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeID, setActiveId] = useState(null);
  const [word, setWord] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // Dodanie searchTerm
  const [searchResults, setSearchResults] = useState([]);

  async function getWords(page) {
    try {
      const response = await api.get(`/words?page=${page}&limit=50`);
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
    const newPage = page + 1;
    const newWords = await getWords(newPage);
    if (newWords.length > 0) {
      setWords((prevWords) => [...prevWords, ...newWords]);
      setPage(newPage);
    }
    setHasMore(newWords.length > 0);
  }

  async function wordData(activeID) {
    try {
      const response = await api.post("/word-detail", { id: activeID });
      if (response.data) {
        setWord(response.data);
      } else {
        console.error("Invalid response from server", response);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function clickedWord(id) {
    setActiveId(id);
    await wordData(id);
  }

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    if (value.length > 0) {
      try {
        const response = await api.get(`/search?query=${value}`);
        if (response.data.length > 0) {
          setSearchResults(response.data.slice(0, 10)); // Limitowanie wyników do 10
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error searching words:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };
  


  return (
    <>
      <div className="words-container">
        <div className="searchbar">
          <input
            type="text"
            placeholder="Search by ID or word"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchResults.length > 0 && (
            <div className="search-results">
              <ul>
                {searchResults.map((result) => (
                  <li
                    key={result.id}
                    onClick={() => {
                      clickedWord(result.id)
                    }}
                  >
                    <span>{result.id}</span>
                    <span>{result.word}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
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
                  <tr
                    key={word.id}
                    id={`word-${word.id}`}
                    onClick={() => clickedWord(word.id)}
                  >
                    <td>{word.id}</td>
                    <td>{word.word}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div>
      <WordDetail word={word} setWord={setWord} />
    </>
  );
}
