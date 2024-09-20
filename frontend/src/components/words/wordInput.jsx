import React from "react";

export default function InputField({ userWord, onChange, onKeyDown }) {
  return (
    <input
      type="text"
      value={userWord}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder="translate the word"
    />
  );
}
