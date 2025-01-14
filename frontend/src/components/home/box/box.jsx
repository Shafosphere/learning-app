import boxImage from "../../../data/box.png";
import "./box.css";
import { FormattedMessage } from "react-intl";
import MyButton from "../../button/button";

export default function Boxes({ boxes, activeBox, handleSetBox, addWords }) {
  const boxNames = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];

  return (
    <div className="container-boxes">
      <div className="boxes-top">
        {boxNames.map((boxName) => (
          <div
            key={boxName}
            onClick={() => handleSetBox(boxName)}
            className="box"
          >
            <img
              alt="box"
              className={activeBox === boxName ? "active" : "notactive"}
              src={boxImage}
            />
            <div className="word-count">{boxes[boxName].length}</div>
          </div>
        ))}
        <div className="smallscreenbutton">
          <MyButton
            message="add"
            color="yellow"
            onClick={addWords}
          />
        </div>
      </div>

      <div className="boxes-bot">
        <MyButton
          message={<FormattedMessage id="addWords" />}
          color="yellow"
          onClick={addWords}
        />
      </div>
    </div>
  );
}
