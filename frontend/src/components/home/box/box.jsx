import boxImage from "../../../data/box.png";
import "./box.css";
export default function Boxes({ boxes, activeBox, handleSetBox, addWords, brunWords }) {

  return (
    <>
      <div className="container-boxes">
        <div className="boxes-top">
          <div onClick={() => handleSetBox("boxOne")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxOne" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{(boxes.boxOne).length}</div>
          </div>

          <div onClick={() => handleSetBox("boxTwo")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxTwo" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{(boxes.boxTwo).length}</div>
          </div>

          <div onClick={() => handleSetBox("boxThree")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxThree" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{(boxes.boxThree).length}</div>
          </div>

          <div onClick={() => handleSetBox("boxFour")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxFour" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{(boxes.boxFour).length}</div>
          </div>

          <div onClick={() => handleSetBox("boxFive")} className="box">
            <img
              alt="box"
              className={`${activeBox === "boxFive" ? "active" : "notactive"}`}
              src={boxImage}
            />
            <div className="word-count">{(boxes.boxFive).length}</div>
          </div>
        </div>

        <div className="boxes-bot">
          <button
            onClick={() => addWords()}
            className="button"
            type="button"
            style={{ "--buttonColor": "var(--tertiary)" }}
          >
            add words
          </button>
          <button
            onClick={() => brunWords()}
            className="button"
            type="button"
            style={{ "--buttonColor": "var(--tertiary)" }}
          >
            Save progress
          </button>
        </div>
      </div>
    </>
  );
}
