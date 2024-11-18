import React from "react";

export default function SecondBookMark({ diacritical, setDiacritical, setSpan}) {
  return (
    <div className="switches">
      <div
        className="switch-container onMouse"
        onMouseEnter={() => setSpan("diacritical")}
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
    </div>
  );
}
