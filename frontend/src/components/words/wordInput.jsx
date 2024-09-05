import React from "react";

export default function InputField({ currentWord, onChange, onKeyDown }) {
    return (
      <input
        type="text"
        value={currentWord}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder="translate the word"
      />
    );
  }
  