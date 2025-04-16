import "./selectlvl.css";
import React from "react";
import { FormattedMessage } from "react-intl";

const DEFAULT_LEVELS = [
  { value: "B2", messageKey: "levelB2" },
  { value: "C1", messageKey: "levelC1" },
];

export default function SelectLvl({
  setDisplay,
  gametype,
  levels = DEFAULT_LEVELS,
  onlyIcons = false,
}) {
  const intlPrefix = gametype || "select";

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

          <div className="select-gametype">
            <FormattedMessage id={`${intlPrefix}.gametype`} defaultMessage="" />
          </div>

          <div className="select-btn-container">
            {levels.map((level) => (
              <div
                key={level.value}
                role="button"
                tabIndex={0}
                onClick={() => setDisplay(level.value)}
                className="display-select"
              >
                {onlyIcons ? (
                  level.icon
                ) : (
                  <>
                    {level.icon && level.icon}{" "}
                    <FormattedMessage
                      id={`${intlPrefix}.${level.messageKey}`}
                      defaultMessage={level.value}
                    />
                  </>
                )}
              </div>
            ))}
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
