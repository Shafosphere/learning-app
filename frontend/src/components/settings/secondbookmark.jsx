import React from "react";
import { FormattedMessage } from "react-intl";

export default function SecondBookMark({
  diacritical,
  setDiacritical,
  setSpan,
  spellChecking,
  setSpellChecking,
}) {
  return (
    <div className="switches">
      <div
        className="switch-container onMouse"
        onMouseEnter={() => setSpan("diacritical")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.diacritical"
            defaultMessage="Diacritical marks"
          />
        </span>
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
        onMouseEnter={() => setSpan("spellChecking")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.spellChecking"
            defaultMessage="Margin of error"
          />
        </span>
        <label className="switch">
          <input
            onClick={() => setSpellChecking(!spellChecking)}
            defaultChecked={spellChecking === true}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>
    </div>
  );
}
