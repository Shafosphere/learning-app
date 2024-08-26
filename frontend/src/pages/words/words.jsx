import "./words.css";
import api from "../../utils/api";
import { useEffect, useState } from "react";

export default function Words() {
  const [currentWord, setWord] = useState("");
  const [data, setData] = useState(null);

  useEffect(() => {
    setWord("Example Word"); // Ustaw początkowe słowo
  }, []);

  async function getData() {
    let maxWordId;
    let minWordId;

    try {
      const response = await api.get("/pre-data");
      minWordId = response.data.minWordId;
      maxWordId = response.data.maxWordId;
    } catch (error) {
      console.error("Błąd podczas pobierania danych:", error);
    }

    const wordList = [];
    for (let i = 0; i < 20; i++) {
      const randomWordId =
        Math.floor(Math.random() * (maxWordId - minWordId + 1)) + minWordId;
      wordList.push(randomWordId);
    }

    try {
      const response = await api.post("http://localhost:8080/data", {
        wordList,
      });
      setData(response.data);
      console.log('dane zapisane')
    } catch (error) {
      console.error("Błąd podczas pobierania słów:", error);
    }
  }

  return (
    <div className="container-words">
      <div className="window-words">
        <input
          type="text"
          value={currentWord}
          onChange={(e) => setWord(e.target.value)}
        />
        <button
          onClick={() => getData()}
          className="button"
          type="button"
          style={{ "--buttonColor": "var(--tertiary)" }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
