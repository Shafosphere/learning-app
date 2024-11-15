import "./vocabulary.css";
import { useState } from "react";

import VocaDefault from "../../components/voca/default/voca-default";
import VocaTest from "../../components/voca/voca-text.jsx/vocatest";

export default function Vocabulary() {
  const [display, setDisplay] = useState("default");

  const renderContent = () => {
    switch (display) {
      case "B2":
      case "C1":
        return <VocaTest setDisplay={setDisplay} lvl={display} />;
      default:
        return <VocaDefault setDisplay={setDisplay} />;
    }
  };

  return <>{renderContent()}</>;
}
