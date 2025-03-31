import React, { Suspense, useContext, useState } from "react";
import Loading from "../../components/loading/loading";
import MyButton from "../../components/button/button";
import "./rankinggmae.css";
import { FaTrophy } from "react-icons/fa";
import { SettingsContext } from "../settings/properties";
import { useNavigate, useLocation } from "react-router-dom";
const RankingGameContent = React.lazy(() =>
  import("../../components/rankinggame/rankinggame")
);

export default function RankingGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const { isLoggedIn } = useContext(SettingsContext);
  const navigate = useNavigate();
  const location = useLocation();
  function start() {
    if (!isLoggedIn) {
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname)}`);
    } else {
      setGameStarted(true);
    }
  }

  return (
    <div className="rankinggame-container">
      <div className="rankinggame-select-window">
        {!gameStarted && (
          <div className="rankinggame-select-main">
            <span className="rankinggame-select-title">arena </span>
            <div className="rankinggame-custom-button" onClick={() => start()}>
              start gry
            </div>
            <p>
              gra rywalizacyjna, na punkty, nie mozna poppełniac błedów, tylko
              dla zalogowanych uzytkowników
            </p>
            <FaTrophy className="icon-rankinggame" />
          </div>
        )}

        {gameStarted && (
          <Suspense fallback={<Loading />}>
            <RankingGameContent />
          </Suspense>
        )}
      </div>
    </div>
  );
}
