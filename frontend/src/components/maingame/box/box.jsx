import boxFull from "../../../data/resized_box_full.png";
import boxHalf from "../../../data/resized_box_half.png";
import boxSome from "../../../data/resized_box_some.png";
import box from "../../../data/resized_box.png";

import "./box.css";
import { FormattedMessage } from "react-intl";
import MyButton from "../../button/button";

export default function Boxes({ boxes, activeBox, handleSetBox, addWords }) {
  const boxNames = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];

  function boxImage(words){
    if (words === 0) {
      return box;
    } else if (words >0 && words < 30){
      return boxSome;
    } else if(words >= 30 && words < 60){
      return boxHalf;
    } else {
      return boxFull;
    }
  }

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
              src={boxImage(boxes[boxName].length)}
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
