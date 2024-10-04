import React, { useState } from "react";
import "./summary.css";
import { RiArrowUpDoubleFill } from "react-icons/ri";

export default function Drawer() {
  const [isVisible, setIsVisible] = useState(false);
  const [animateClass, setAnimateClass] = useState("");

  const toggleDiv = () => {
    if (isVisible) {
      // Jeśli Drawer jest widoczny, rozpocznij animację wyjścia
      setAnimateClass("hidden-drawer");
      // Po zakończeniu animacji ukryj Drawer
      setTimeout(() => {
        setIsVisible(false);
        setAnimateClass("");
      }, 500); // Czas trwania animacji w ms
    } else {
      // Jeśli Drawer jest ukryty, pokaż go i rozpocznij animację wejścia
      setIsVisible(true);
      setAnimateClass("visible-drawer");
    }
  };

  return (
    <>
      {/* Przycisk do przełączania Drawer */}
      <div className="sign" onClick={toggleDiv}>
        <RiArrowUpDoubleFill />
      </div>

      {/* Drawer z animacją */}
      {(isVisible || animateClass === "hidden-drawer") && (
        <div className={`drawer ${animateClass}`}>
          <button
            style={{ "--buttonColor": "var(--tertiary)" }}
            className="button"
          >
            import
          </button>
          <p>
            - zimportuje to twoje dobre wyniki do głównej gry, słowa te będą
            uznane jako 'znane' i pomijane przy dobieraniu nowych słówek
          </p>
        </div>
      )}
    </>
  );
}

//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////
//////////

//////////
//////////
//////////
//////////

// do zrobienia polskie znaki i import, narpawic home / napisac na nowo
