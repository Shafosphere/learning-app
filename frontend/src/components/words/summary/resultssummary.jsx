import React, { useState, useEffect, useMemo } from "react";
import "./summary.css";

export default function ResultsSummary() {
  // Zamiast bezpośrednio tworzyć tablicę "messages", używamy useMemo
  const messages = useMemo(() => [
    "Gratulacje!",
    "Ukończyłeś wszystkie części! :D",
    "a oto wyniki:"
  ], []);

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [moveUp, setMoveUp] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (currentMessageIndex < messages.length) {
      if (charIndex < messages[currentMessageIndex].length) {
        const timeout = setTimeout(() => {
          setDisplayedText(
            prev => prev + messages[currentMessageIndex][charIndex]
          );
          setCharIndex(prev => prev + 1);
        }, 100); // Prędkość pisania
        return () => clearTimeout(timeout);
      } else {
        if (currentMessageIndex === 2) {
          // Ostatnia wiadomość, po której przesuwamy tekst w górę i pokazujemy wyniki
          const timeout = setTimeout(() => {
            setMoveUp(true);
          }, 1000); // Opóźnienie przed przesunięciem w górę
          return () => clearTimeout(timeout);
        } else {
          // Przejście do następnej wiadomości
          const timeout = setTimeout(() => {
            setDisplayedText("");
            setCharIndex(0);
            setCurrentMessageIndex(prev => prev + 1);
          }, 1000); // Opóźnienie przed następną wiadomością
          return () => clearTimeout(timeout);
        }
      }
    }
  }, [charIndex, currentMessageIndex, messages]);

  useEffect(() => {
    if (moveUp) {
      const timeout = setTimeout(() => {
        setShowResults(true);
      }, 1000); // Czekamy na zakończenie animacji przesuwania w górę
      return () => clearTimeout(timeout);
    }
  }, [moveUp]);

  return (
    <div className="results-summary">
      {currentMessageIndex < 3 && !moveUp && (
        <div className="typing">{displayedText}</div>
      )}
      {moveUp && (
        <div className="typing move-up">{messages[2]}</div>
      )}
      {showResults && (
        <div className="results">
          <div>wyniki</div>
        </div>
      )}
    </div>
  );
}
