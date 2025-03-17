import React, { Suspense, useContext, useState } from "react";
import Loading from "../../components/loading/loading";
import MyButton from "../../components/button/button";
import "./rankinggmae.css";
import { FaTrophy } from "react-icons/fa";
import { SettingsContext } from "../settings/properties";
import { useNavigate } from "react-router-dom";
const RankingGameContent = React.lazy(() =>
  import("../../components/rankinggame/rankinggame")
);

export default function RankingGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const {isLoggedIn} = useContext(SettingsContext)
  const navigate = useNavigate();

  function start(){
    if(!isLoggedIn){
      console.log("sprawdzam " + isLoggedIn);
      navigate("/login");
    } else {
      setGameStarted(true);
    }
  }

  return (
    <div className="rankinggame-container">
      <div className="rankinggame-select-window">
        {!gameStarted && (
          <div className="rankinggame-trophy">
            <FaTrophy className="icon-rankinggame" />
            <div className="rankinggame-trophy-text">
              <span>gra </span>
              <span>rywalizacyjna</span>
            </div>
            <div className="rankinggame-trophy-button">
              <span>(tylko dla zalogowanych)</span>
              <MyButton
                message="start gry"
                color="green"
                onClick={() => start()}
              />
            </div>
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
