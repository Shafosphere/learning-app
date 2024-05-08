import boxImage from "../../../data/box.png";
import "./box.css";
export default function Boxes({ boxes, activeBox, setActiveBox }) {
  return (
    <>
      <div className="container-boxes">
        <div className="boxes-top">
          <div onClick={() => setActiveBox("boxOne")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxOne" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{boxes.boxOne}</div>
          </div>

          <div onClick={() => setActiveBox("boxTwo")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxTwo" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{boxes.boxTwo}</div>
          </div>

          <div onClick={() => setActiveBox("boxThree")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxThree" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{boxes.boxThree}</div>
          </div>

          <div onClick={() => setActiveBox("boxFour")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxFour" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{boxes.boxFour}</div>
          </div>

          <div onClick={() => setActiveBox("boxFive")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxFive" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{boxes.boxFive}</div>
          </div>
        </div>

        <div className="boxes-bot">
          <button
            // onClick={() => showLetter()}
            className="button"
            type="button"
            style={{ "--buttonColor": "var(--tertiary)" }}
          >
            add words
          </button>
          <button
            // onClick={() => showLetter()}
            className="button"
            type="button"
            style={{ "--buttonColor": "var(--tertiary)" }}
          >
            burn words
          </button>
        </div>
      </div>
    </>
  );
}
