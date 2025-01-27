import React from "react";
import { useIntl } from "react-intl";
import { FormattedMessage } from "react-intl";
import MyButton from "../button/button";

export default function SecondBookMark({
  diacritical,
  setDiacritical,
  setSpan,
  spellChecking,
  setSpellChecking,
  showConfirm,
}) {
  const intl = useIntl();

  function resetProgress(lvl) {
    localStorage.removeItem(`carouselItems-${lvl}`);
    localStorage.removeItem(`lastDataItemId-${lvl}`);
    localStorage.removeItem(`currentPatch-${lvl}`);
    localStorage.removeItem(`patchLength-${lvl}`);
    localStorage.removeItem(`dataIndexForBottomDiv-${lvl}`);
    localStorage.removeItem(`end-${lvl}`);
    localStorage.removeItem(`summary-${lvl}`);
    localStorage.removeItem(`wordsAnsweredCount-${lvl}`);
  }

  return (
    <div className="switches">
      {/* Diacritical marks */}
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
            defaultChecked={diacritical === false}
            type="checkbox"
          />
          <span className="slider round"></span>
        </label>
      </div>

      {/* Margin of error */}
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

      {/* Reset vocabulary B2 */}
      <div
        className="container-resets onMouse"
        onMouseEnter={() => setSpan("resetsvocabulary")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.resetB2"
            defaultMessage="Reset vocabulary B2"
          />
        </span>
        <div className="resets-buttons">
          <MyButton
            message={intl.formatMessage({
              id: "switches.buttonB2",
              defaultMessage: "B2",
            })}
            color="red"
            onClick={() =>
              showConfirm(
                intl.formatMessage({
                  id: "switches.confirmResetB2",
                  defaultMessage: "Are you sure you want to reset level B2?",
                }),
                () => resetProgress("B2")
              )
            }
          />
        </div>
      </div>

      {/* Reset vocabulary C1 */}
      <div
        className="container-resets onMouse"
        onMouseEnter={() => setSpan("resetsvocabulary")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.resetC1"
            defaultMessage="Reset vocabulary C1"
          />
        </span>
        <div className="resets-buttons">
          <MyButton
            message={intl.formatMessage({
              id: "switches.buttonC1",
              defaultMessage: "C1",
            })}
            color="red"
            onClick={() =>
              showConfirm(
                intl.formatMessage({
                  id: "switches.confirmResetC1",
                  defaultMessage: "Are you sure you want to reset level C1?",
                }),
                () => resetProgress("C1")
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
