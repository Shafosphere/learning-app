import React, { useState } from "react";
import "./custominput.css";

export default function LearingInput({
  placeholder,
  maxLength,
  value,
  correctWordChange,
  correctWordRef,
  autoFocus // Dodajemy nową prop
}) {
  const [scroll, setScroll] = useState(0);

  const handleScroll = (e) => {
    setScroll(e.target.scrollLeft);
  };

  return (
    <div className="input-container-flashcard">
      <input
        type="text"
        value={value}
        onChange={correctWordChange}
        onScroll={handleScroll}
        className={`custom-input-flashcard`}
        maxLength={maxLength}
        ref={correctWordRef}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        name="wordInput"
        autoCapitalize="off"
        autoFocus={autoFocus} // Używamy nowej propsy
      />
      <span
        className="persistent-placeholder"
        style={{ left: `calc(0px - ${scroll}px)` }}
      >
        {placeholder}
      </span>
    </div>
  );
}