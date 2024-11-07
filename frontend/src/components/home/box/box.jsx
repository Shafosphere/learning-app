import boxImage from "../../../data/box.png";
import "./box.css";
import { FormattedMessage } from 'react-intl';

export default function Boxes({ boxes, activeBox, handleSetBox, addWords, saveBoxes }) {
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
            <FormattedMessage id="addWords" />
          </button>
          <button
            onClick={() => saveBoxes()}
            className="button"
            type="button"
            style={{ "--buttonColor": "var(--tertiary)" }}
          >
            <FormattedMessage id="saveProgress" />
          </button>
        </div>
      </div>
    </>
  );
}
