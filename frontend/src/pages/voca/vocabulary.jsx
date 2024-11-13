import "./vocabulary.css";
import { useState } from "react";

import VocaDefault from "../../components/voca/default/voca-default";
import WordsB2 from "../../components/voca/b2/wordsb2";
import WordsC1 from "../../components/voca/c1/wordsc1";

import { IoIosArrowBack } from "react-icons/io";

export default function Vocabulary() {
  const [display, setDisplay] = useState("default");

  const renderContent = () => {
    switch (display) {
      case "B2":
        return (
          <>
            <ReturnButton setDisplay={setDisplay} display={display} />
            <WordsB2 />
          </>
        );
      case "C1":
        return (
          <>
            <ReturnButton setDisplay={setDisplay} display={display} />
            <WordsC1 />
          </>
        );
      default:
        return <VocaDefault setDisplay={setDisplay} />;
    }
  };

  return <>{renderContent()}</>;
}

// Zmieniamy returnButton na komponent
const ReturnButton = ({ setDisplay, display }) => (
  <div className="return-btn-voca" onClick={() => setDisplay("default")}>
    <div>
      <IoIosArrowBack />
      <p>back</p>
    </div>
    <h1>{display}</h1>
  </div>
);
