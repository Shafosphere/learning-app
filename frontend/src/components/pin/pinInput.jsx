import React, { useState, useRef } from "react";
import "./pin.css";

// Component for entering a fixed-length numeric PIN
export default function PinInput({ length = 4, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Allow only digits
    if (!/^\d*$/.test(val)) {
      return;
    }

    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);

    // Move focus to the next input if not the last one
    if (val && index < length - 1) {
      inputs.current[index + 1].focus();
    }

    // If all fields are filled, trigger the onComplete callback
    if (newValues.every((num) => num !== "")) {
      onComplete(newValues.join(""));
    }
  };

  const handleBackspace = (e, index) => {
    // On Backspace in an empty field, clear previous and focus it
    if (e.key === "Backspace" && !values[index] && index > 0) {
      const newValues = [...values];
      newValues[index - 1] = "";
      setValues(newValues);
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className="pin-input-container">
      {values.map((value, index) => (
        <input
          key={index}
          type="password"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleBackspace(e, index)}
          ref={(el) => (inputs.current[index] = el)}
          autoFocus={index === 0}
        />
      ))}
    </div>
  );
}
