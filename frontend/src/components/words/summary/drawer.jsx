import React, { useState } from "react";
import "./summary.css";
import { RiArrowUpDoubleFill } from "react-icons/ri";

export default function Drawer() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleDiv = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Przycisk do przełączania drawer */}
      <div className="sign" onClick={toggleDiv}>
        <RiArrowUpDoubleFill />
      </div>

      {/* Drawer z animacją */}
      <div className={`drawer ${isVisible ? "visible" : ""}`}>
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
    </>
  );
}
