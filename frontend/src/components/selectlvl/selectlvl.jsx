import "./selectlvl.css"
import React from "react";
import { FormattedMessage } from "react-intl";

export default function SelectLvl({ setDisplay, gametype }) {
  return (
    <div className="select-container">
      <div className="select-window">
        <div className="select-popup">
          <h1>
            <FormattedMessage
              id="select.chooseLevel"
              defaultMessage="Choose level"
            />
          </h1>

          <div className="select-btn-container">
            <div
              onClick={() => {
                setDisplay("B2");
              }}
              className="display-select"
            >
              <FormattedMessage id="select.levelB2" defaultMessage="B2" />
            </div>

            <div
              onClick={() => {
                setDisplay("C1");
              }}
              className="display-select"
            >
              <FormattedMessage id="select.levelC1" defaultMessage="C1" />
            </div>
          </div>

          <p>
            <FormattedMessage
              id="select.chooseTest"
              defaultMessage="What level of flashcards are you choosing?"
            />
          </p>
        </div>
      </div>
    </div>
  );
}
