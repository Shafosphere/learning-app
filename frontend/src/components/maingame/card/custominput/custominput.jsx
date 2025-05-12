import React, { useState } from "react";
import "./custominput.css";

// Custom input component with a persistent placeholder for flashcards
export default function LearningInput({
  placeholder,
  maxLength,
  value,
  correctWordChange,
  correctWordRef,
  autoFocus, // Whether to auto-focus this input
}) {
  const [scroll, setScroll] = useState(0);

  // Track horizontal scroll to adjust placeholder position
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
        className="custom-input-flashcard"
        maxLength={maxLength}
        ref={correctWordRef}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        name="wordInput"
        autoCapitalize="off"
        autoFocus={autoFocus} // Use the autoFocus prop
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
