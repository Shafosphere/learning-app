import React, { Suspense, useContext, useState } from "react";
import Loading from "../../components/loading/loading";
import "./arena.css";
import { FaTrophy } from "react-icons/fa";
import { SettingsContext } from "../settings/properties";
import { useNavigate, useLocation } from "react-router-dom";
const ArenaContent = React.lazy(() =>
  import("../../components/arena/arena")
);

export default function Arena() {
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
    <div className="arena-container">
      <div className="arena-select-window">
        {!gameStarted && (
          <div className="arena-select-main">
            <span className="arena-select-title">arena </span>
            <div className="arena-custom-button" onClick={() => start()}>
              start gry
            </div>
            <p>
              gra rywalizacyjna, na punkty, nie mozna poppełniac błedów, tylko
              dla zalogowanych uzytkowników
            </p>
            <FaTrophy className="icon-arena" />
          </div>
        )}

        {gameStarted && (
          <Suspense fallback={<Loading />}>
            <ArenaContent />
          </Suspense>
        )}
      </div>
    </div>
  );
}
