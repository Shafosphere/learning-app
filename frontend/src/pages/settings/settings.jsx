import "./settings.css";
export default function Settings() {
  return (
    <>
      <div className="container-settings">
        <div className="belt-settings">
          <div className="small-belt-left">
            <span className="reset-title">reset progress</span>
            <div className="buttons-settings">
              <button
                className="button reset-button"
                type="button"
                style={{ "--buttonColor": "var(--tertiary)" }}
              >
                Boxes
              </button>
              <button
                className="button reset-button"
                type="button"
                style={{ "--buttonColor": "var(--tertiary)" }}
              >
                All
              </button>
            </div>
          </div>
          <dic className="small-belt-right"></dic>
        </div>
      </div>
    </>
  );
}
