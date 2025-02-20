import React, { useState } from "react";
import "./custominput.css";

export default function LearingInput({
  placeholder,
  maxLength,
  value,
  correctWordChange,
  correctWordRef,
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
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
        name="wordInput"
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
