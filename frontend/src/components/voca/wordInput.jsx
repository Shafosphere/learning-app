import React from "react";
import { useIntl } from "react-intl";

export default function InputField({ userWord, onChange, onKeyDown }) {
  const intl = useIntl();

  return (
    <input
      className="voca_input"
      type="text"
      value={userWord}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={intl.formatMessage({
        id: "vocaTest.translateTheWord",
        defaultMessage: "Translate the word"
      })}
    />
  );
}
