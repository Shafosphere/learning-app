import { FormattedMessage } from "react-intl";
import MyButton from "../../button/button";
import React, { useEffect } from "react";

import SkinSelector from "./skinselector";
export default function Boxes({ boxes, activeBox, handleSetBox, addWords }) {
  const boxNames = ["boxOne", "boxTwo", "boxThree", "boxFour", "boxFive"];

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
            <SkinSelector boxName={boxName} activeBox={activeBox} boxes={boxes} />
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
