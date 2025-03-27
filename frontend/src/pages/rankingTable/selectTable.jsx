import { useState } from "react";
import SelectLvl from "../../components/selectlvl/selectlvl";
import RankingTableContent from "../../components/rankingtable/rankingtablecontent";

export default function RankingTableSelect() {
  const [display, setDisplay] = useState("default");

  const renderContent = () => {
    switch (display) {
      case "Fiszki":
      case "Rywalizacja":
        return <RankingTableContent setDisplay={setDisplay} lvl={display} />;
      default:
        return (
          <SelectLvl 
            setDisplay={setDisplay} 
            gametype="ranking"
            levels={[
              { value: "Fiszki", messageKey: "levelFiszki" },
              { value: "Rywalizacja", messageKey: "levelRywalizacja" },
            ]}
          />
        );
    }
  };

  return <>{renderContent()}</>;
}