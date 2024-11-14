import "./vocabulary.css";
import { useState } from "react";

import VocaDefault from "../../components/voca/default/voca-default";
import WordsB2 from "../../components/voca/b2/wordsb2";
import WordsC1 from "../../components/voca/c1/wordsc1";

export default function Vocabulary() {
  const [display, setDisplay] = useState("default");

  const renderContent = () => {
    switch (display) {
      case "B2":
        return (
          <>
            <WordsB2 setDisplay={setDisplay} />
          </>
        );
      case "C1":
        return (
          <>
            <WordsC1 setDisplay={setDisplay} />
          </>
        );
      default:
        return <VocaDefault setDisplay={setDisplay} />;
    }
  };

  return <>{renderContent()}</>;
}
