import { FaBook, FaTrophy } from "react-icons/fa";
import { useState } from "react";
import SelectLvl from "../../components/selectlvl/selectlvl";
import RankingTableContent from "../../components/rankingtable/rankingtablecontent";

export default function RankingTableSelect() {
  const [display, setDisplay] = useState("default");

  const renderContent = () => {
    switch (display) {
      case "Flashcards":
      case "Ranking":
        return <RankingTableContent setDisplay={setDisplay} lvl={display} />;
      default:
        return (
          <SelectLvl
            setDisplay={setDisplay}
            onlyIcons={true}
            gametype="ranking"
            levels={[
              {
                value: "Flashcards",
                messageKey: "levelFlashcards",
                icon: <FaBook />,
              },
              {
                value: "Ranking",
                messageKey: "levelRanking",
                icon: <FaTrophy />,
              },
            ]}
          />
        );
    }
  };

  return <>{renderContent()}</>;
}
