import "./flashcard.css";
export default function EmptyFlashcard() {
  return (
    <>
      <div className="container-flashcard">
        <div className={`wrong-answer`} style={{ visibility: "hidden" }}>
          <span>Answear is:_</span>
          <span style={{ color: "red" }}></span>
        </div>
        <form>
          <div className="top-flashcard">
            <div className={`window-flashcard`}>
              <div className="hidden-message">
                Please select a box with words
              </div>
            </div>

            <div className="button-container">
              <button
                className="button"
                type="button"
                style={{ "--buttonColor": "var(--highlight)" }}
              >
                submit
              </button>
              <button
                className="button"
                type="button"
                style={{ "--buttonColor": "var(--secondary)" }}
              >
                first letter
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
