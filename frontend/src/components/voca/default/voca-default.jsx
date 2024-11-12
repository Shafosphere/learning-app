import MyButton from "../../button/button";

export default function VocaDefault({setDisplay}) {

  return (
    <div className="vocabulary-container">
      <div className="vocabulary-window">
        <div className="vocabulary-popup">
          <h1>Choose level</h1>
          <div>
            <p>
              This is a test of your vocabulary knowledge, what level do you
              choose?
            </p>
            <div>
              <MyButton
                message="B2"
                color="yellow"
                onClick={() => setDisplay("B2")}
              />
              <MyButton
                message="C1"
                color="yellow"
                onClick={() => setDisplay("C1")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
