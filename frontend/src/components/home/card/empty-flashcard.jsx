import "./flashcard.css";
import { FormattedMessage } from 'react-intl';

export default function EmptyFlashcard() {
  return (
    <>
      <div className="container-flashcard">
        
        <div className={`wrong-answer`} style={{ visibility: "hidden" }}>
          <span><FormattedMessage id="answerIs" />_</span>
          <span style={{ color: "red" }}></span>
        </div>
        <form className="form-flashcard">

          <div className="top-flashcard">
            <div className={`window-flashcard`}>
              <div className="hidden-message">
                <FormattedMessage id="pleaseSelectBox" />
              </div>
            </div>

            <div className="button-container">
              <button
                className="button"
                type="button"
                style={{ "--buttonColor": "var(--highlight)" }}
              >
                <FormattedMessage id="submit" />
              </button>
              <button
                className="button"
                type="button"
                style={{ "--buttonColor": "var(--secondary)" }}
              >
                <FormattedMessage id="firstLetter" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
