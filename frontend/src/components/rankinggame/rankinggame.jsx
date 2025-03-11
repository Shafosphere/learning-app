import { useEffect, useState } from "react";
import "./rankinggmae.css";
import MyButton from "../button/button";
import api from "../../utils/api";

export default function RankingGameContent() {
  const [data, setdata] = useState();
  const [cards, setCards] = useState(
    Array(10).fill({
      Move: 0,
      Rotate: 0,
      zIndex: 1,
      chosen: false,
      content: " .. ",
    })
  );

  useEffect(() => {
    fetchNewWords();
  }, []);

  useEffect(() => {
    async function getWord() {
      try {
        const response = await api.get("/word/ranking-word");
        setdata(response.data);
      } catch (error) {
        console.error("Error fetching visits data:", error);
        return [];
      }
    }
    getWord();
  }, []);

  const fetchNewWords = async () => {
    try {
      const response = await api.get("/word/random-words?count=10");
      const newCards = response.data.map((word, index) => ({
        Move: 0,
        Rotate: 0,
        zIndex: index + 1,
        chosen: false,
        content: word.content
      }));
      setCards(newCards);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const initialState = [
    { Move: 0, Rotate: 0, zIndex: 1, chosen: false, content: "raz" },
    { Move: 0, Rotate: 0, zIndex: 2, chosen: false, content: "dwa" },
    { Move: 0, Rotate: 0, zIndex: 3, chosen: false, content: "trzy" },
    { Move: 0, Rotate: 0, zIndex: 4, chosen: false, content: "cztery" },
    { Move: 0, Rotate: 0, zIndex: 5, chosen: false, content: "piec" },
    { Move: 0, Rotate: 0, zIndex: 6, chosen: false, content: "szesc" },
    { Move: 0, Rotate: 0, zIndex: 7, chosen: false, content: "siedem" },
    { Move: 0, Rotate: 0, zIndex: 8, chosen: false, content: "osiem" },
    { Move: 0, Rotate: 0, zIndex: 9, chosen: false, content: "dziewiec" },
    { Move: 0, Rotate: 0, zIndex: 10, chosen: false, content: "dziesiec" },
  ];


  function shuffle() {
    const currentChosenIndex = cards.findIndex((card) => card.chosen);
    let randomCardIndex = Math.floor(Math.random() * cards.length);
    if (currentChosenIndex !== -1 && cards.length > 1) {
      while (randomCardIndex === currentChosenIndex) {
        randomCardIndex = Math.floor(Math.random() * cards.length);
      }
    }
    const newCards = cards.map((card, index) => {
      const isUp = Math.random() < 0.5;
      const offset = Math.floor(Math.random() * 3) + 3;
      const move = isUp ? -offset : offset;
      const randomAngle = Math.floor(Math.random() * 15) + 5;
      const rotate = isUp ? randomAngle : -randomAngle;
      const chosen = index === randomCardIndex;
      const zIndex = chosen ? 11 : 1;
      return {
        ...card,
        Move: move,
        Rotate: rotate,
        zIndex: zIndex,
        chosen: chosen,
      };
    });

    setCards(newCards);

    setTimeout(() => {
      setCards((currentCards) =>
        currentCards.map((card) => ({
          ...card,
          Move: 0,
          Rotate: 0,
        }))
      );
    }, 750);
  }

  return (
    <div className="rankinggmae-container">
      <div className="rankinggmae-window">
        <input className="rankinggame-input" />
        <div className="deck">
          {cards.map((item, index) => (
            <div
              className={`card ${item.chosen ? "chosen_card" : ""}`}
              key={index}
              style={{
                transform: `translateY(${item.Move}rem) rotate(${item.Rotate}deg)`,
                zIndex: item.zIndex,
              }}
            >
              {item.chosen ? data?.[1] || "Ładowanie..." : item.content}
            </div>
          ))}
        </div>
      </div>
      <div className="rankinggmae-button">
        <MyButton message="shuffle" color="green" onClick={shuffle} />
      </div>
    </div>
  );
}
