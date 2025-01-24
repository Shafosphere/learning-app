import boxFull from "../../../data/resized_box_full.png";
import boxHalf from "../../../data/resized_box_half.png";
import boxSome from "../../../data/resized_box_some.png";
import box from "../../../data/resized_box.png";

import "./box.css";
import { FormattedMessage } from "react-intl";
import MyButton from "../../button/button";
import React, { useEffect } from "react";

export default function Boxes({ boxes, activeBox, handleSetBox, addWords }) {
  const boxNames = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];

  function boxImage(words) {
    if (words === 0) {
      return box;
    } else if (words > 0 && words < 30) {
      return boxSome;
    } else if (words >= 30 && words < 60) {
      return boxHalf;
    } else {
      return boxFull;
    }
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const boxes = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];
      const index = boxes.indexOf(activeBox);

      if (event.key === "ArrowRight") {
        handleSetBox(boxes[(index + 1) % boxes.length]);
      } else if (event.key === "ArrowLeft") {
        handleSetBox(boxes[(index + boxes.length - 1) % boxes.length]);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeBox, handleSetBox]);

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
          <MyButton message="add" color="yellow" onClick={addWords} />
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
