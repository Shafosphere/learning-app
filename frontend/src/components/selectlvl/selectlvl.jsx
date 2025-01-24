import "./selectlvl.css";
import React from "react";
import { FormattedMessage } from "react-intl";

export default function SelectLvl({ setDisplay, gametype }) {
  const intlPrefix = gametype === "vocabulary" ? "vocabulary" : "select";

  return (
    <div className="select-container">
      <div className="select-window">
        <div className="select-popup">
          <h1>
            <FormattedMessage
              id={`${intlPrefix}.chooseLevel`}
              defaultMessage="Choose level"
            />
          </h1>

          <div className="select-btn-container">
            <div onClick={() => setDisplay("B2")} className="display-select">
              <FormattedMessage
                id={`${intlPrefix}.levelB2`}
                defaultMessage="B2"
              />
            </div>
            <div onClick={() => setDisplay("C1")} className="display-select">
              <FormattedMessage
                id={`${intlPrefix}.levelC1`}
                defaultMessage="C1"
              />
            </div>
          </div>

          <p>
            <FormattedMessage
              id={`${intlPrefix}.chooseTest`}
              defaultMessage="Choose level!"
            />
          </p>
        </div>
      </div>
    </div>
  );
}
