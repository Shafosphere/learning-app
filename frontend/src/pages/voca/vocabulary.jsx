import "./vocabulary.css";
import { useState } from "react";
import VocaTest from "../../components/voca/voca-text.jsx/vocatest";
import SelectLvl from "../../components/selectlvl/selectlvl";

export default function Vocabulary() {
  const [display, setDisplay] = useState("default");

  const renderContent = () => {
    switch (display) {
      case "B2":
      case "C1":
        return <VocaTest setDisplay={setDisplay} lvl={display} />;
      default:
        return <SelectLvl setDisplay={setDisplay} gametype="vocabulary" />;
    }
  };

  return <>{renderContent()}</>;
}
