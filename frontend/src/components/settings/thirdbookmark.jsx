import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import MyButton from "../button/button";

export default function ThirdBookMark({
  setSpan,
  showConfirm,
  clearEverything,
  resetProgressVoca,
  resetProgressFlashcards,
}) {
  const intl = useIntl();

  return (
    <div className="switches">
      {/* Reset ALL */}
      <div
        className="container-resets onMouse"
        onMouseEnter={() => setSpan("resetsbuttons")}
      >
        <span className="switch-text">
          <FormattedMessage id="resetButtons" defaultMessage="Reset Buttons" />
        </span>
        <div className="resets-buttons">
          <MyButton
            message={<FormattedMessage id="resetAll" defaultMessage="All" />}
            color="red"
            onClick={() =>
              showConfirm(
                <FormattedMessage
                  id="areYouSureResetEverything"
                  defaultMessage="Are you sure you want to reset everything?"
                />,
                () => clearEverything()
              )
            }
          />
        </div>
      </div>

      {/* Reset Flashcards */}
      <div
        className="container-resets onMouse"
        onMouseEnter={() => setSpan("resetsflashcard")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.resetFlash"
            defaultMessage="Reset vocabulary progress"
          />
        </span>
        <div className="resets-buttons">
          <MyButton
            message={"B2"}
            color="red"
            onClick={() =>
              showConfirm("Czy chcesz zresetować pudełka w B2?", () =>
                resetProgressFlashcards("B2")
              )
            }
          />
          <MyButton
            message={"C1"}
            color="red"
            onClick={() =>
              showConfirm("Czy chcesz zresetować pudełka w C1?", () =>
                resetProgressFlashcards("C1")
              )
            }
          />
        </div>
      </div>

      {/* Reset Vocabulary */}
      <div
        className="container-resets onMouse"
        onMouseEnter={() => setSpan("resetsvocabulary")}
      >
        <span className="switch-text">
          <FormattedMessage
            id="switches.resetVoca"
            defaultMessage="Reset vocabulary progress"
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
                () => resetProgressVoca("B2")
              )
            }
          />

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
                () => resetProgressVoca("C1")
              )
            }
          />
        </div>
      </div>
    </div>
  );
}
