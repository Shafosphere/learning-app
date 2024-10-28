import React from "react";

export default function SecondBookMark({ diacritical, setDiacritical }) {
  return (
    <div className="switches">
      <div
        className="switch-container onMouse"
        // onMouseEnter={() => setSpan("Sounds")}
      >
        <span className="switch-text">znaki diakrytyczne</span>
        <label className="switch">
          <input
            onClick={() => setDiacritical(!diacritical)}
            defaultChecked={diacritical === true}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>
      <div
        className="switch-container onMouse"
        // onMouseEnter={() => setSpan("Sounds")}
      >
        <span className="switch-text">vocabulary import</span>
        <label className="switch">
          <input
            // onClick={toggleSound}
            // defaultChecked={isSoundEnabled === "true"}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
}
