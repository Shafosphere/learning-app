import boxFull from "../../../data/resized_box_full.png";
import boxHalf from "../../../data/resized_box_half.png";
import boxSome from "../../../data/resized_box_some.png";
import box from "../../../data/resized_box.png";

import { useState } from "react";
import NewSkinBox from "./newskinbox"; // Upewnij się, że ścieżka jest poprawna

export default function SingleBox({ boxName, activeBox, boxes }) {
  const [skin, setSkin] = useState(true);

  function boxImage(words) {
    // Logika starego systemu
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
      {skin ? (
        // Nowy system skórek z animacją
        <NewSkinBox  activeBox={activeBox} boxName={boxName}/>
      ) : (
        // Stary system – pojedynczy obraz, który może zmieniać się w zależności od wartości
        <img
          alt="box"
          className={activeBox === boxName ? "active" : "notactive"}
          src={boxImage(boxes[boxName].length)}
        />
      )}
    </>
  );
}
