import React, { useState } from "react";
import "./custominput.css";

export default function LearingInput({
  className, // nowy prop
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
    <div className="input-container123">
      <input
        type="text"
        value={value}
        onChange={correctWordChange}
        onScroll={handleScroll}
        className={`custom-input123 ${className || ""}`}
        maxLength={maxLength}
        ref={correctWordRef}
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
