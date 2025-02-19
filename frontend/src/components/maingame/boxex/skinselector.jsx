import boxFull from "../../../data/resized_box_full.png";
import boxHalf from "../../../data/resized_box_half.png";
import boxSome from "../../../data/resized_box_some.png";
import box from "../../../data/resized_box.png";
import { SettingsContext } from "../../../pages/settings/properties";

import { useContext } from "react";
import CuteBoxSkin from "./cutebox"; // Upewnij się, że ścieżka jest poprawna

export default function SkinSelector({ boxName, activeBox, boxes }) {
  const { skinstatus } = useContext(SettingsContext);

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

  return (
    <>
      {!skinstatus ? (
        //newskin
        <CuteBoxSkin
          activeBox={activeBox}
          boxName={boxName}
          words={boxes[boxName].length}
        />
      ) : (
        //oldskin
        <img
          alt="box"
          className={activeBox === boxName ? "active" : "notactive"}
          src={boxImage(boxes[boxName].length)}
        />
      )}
    </>
  );
}
