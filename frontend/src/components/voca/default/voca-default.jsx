import React from "react";
import { FormattedMessage } from "react-intl";

export default function VocaDefault({ setDisplay }) {
  return (
    <div className="vocabulary-container">
      <div className="vocabulary-window">
        <div className="vocabulary-popup">
          <h1>
            <FormattedMessage
              id="vocabulary.chooseLevel"
              defaultMessage="Choose level"
            />
          </h1>

          <div className="vocabulary-btn-container">
            <div
              onClick={() => {
                setDisplay("B2");
              }}
              className="display-voca"
            >
              <FormattedMessage id="vocabulary.levelB2" defaultMessage="B2" />
            </div>

            <div
              onClick={() => {
                setDisplay("C1");
              }}
              className="display-voca"
            >
              <FormattedMessage id="vocabulary.levelC1" defaultMessage="C1" />
            </div>
          </div>

          <p>
            <FormattedMessage
              id="vocabulary.chooseTest"
              defaultMessage="This is a test of your vocabulary knowledge, what level do you choose?"
            />
          </p>
        </div>
      </div>
    </div>
  );
}
