export default function VocaDefault({ setDisplay }) {
  return (
    <div className="vocabulary-container">
      <div className="vocabulary-window">
        <div className="vocabulary-popup">
          <h1>Choose level</h1>

          <div className="vocabulary-btn-container">
            
            <div
              onClick={() => {
                setDisplay("B2");
              }}
              className="display-voca"
            >
              B2
            </div>

            <div
              onClick={() => {
                setDisplay("C1");
              }}
              className="display-voca"
            >
              C1
            </div>

          </div>

          <p>
            This is a test of your vocabulary knowledge, what level do you
            choose?
          </p>
        </div>
      </div>
    </div>
  );
}
