import React from "react";

export default function InputField({ userWord, onChange, onKeyDown }) {
  return (
    <input
      className="voca_input"
      type="text"
      value={userWord}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="translate the word"
    />
  );
}
