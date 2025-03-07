import "./maingame.css";
import { useState } from "react";

import SelectLvl from "../../components/selectlvl/selectlvl";
import MainGame from "./maingame";

export default function MainGameSelect() {
  const [display, setDisplay] = useState("default");

  const renderContent = () => {
    switch (display) {
      case "B2":
      case "C1":
        return <MainGame setDisplay={setDisplay} lvl={display} />;
      default:
        return <SelectLvl setDisplay={setDisplay} />;
    }
  };

  return <>{renderContent()}</>;
}
