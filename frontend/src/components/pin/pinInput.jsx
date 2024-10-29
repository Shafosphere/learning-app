import React, { useState, useRef } from "react";
import "./pin.css";

export default function PinInput({ length = 4, onComplete }) {
  const [values, setValues] = useState(Array(length).fill(""));
  const inputs = useRef([]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) {
      // Pozwalamy tylko na cyfry
      return;
    }

    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);

    if (val && index < length - 1) {
      // Przechodzimy do następnego inputu
      inputs.current[index + 1].focus();
    }

    if (newValues.every((num) => num !== "")) {
      // Jeśli wszystkie pola są wypełnione, wywołujemy callback
      onComplete(newValues.join(""));
    }
  };

  const handleBackspace = (e, index) => {
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
