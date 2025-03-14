import React, { Suspense, useState } from "react";
import Loading from "../../components/loading/loading";
import MyButton from "../../components/button/button";
import "./rankinggmae.css";
import { FaTrophy } from "react-icons/fa";
const RankingGameContent = React.lazy(() =>
  import("../../components/rankinggame/rankinggame")
);

export default function RankingGame() {
  const [gameStarted, setGameStarted] = useState(false);

  return (
    <div className="rankinggame-container">
      {!gameStarted && (
        <div>
          <FaTrophy  className="icon-rankinggame"/>
          {/* <div>
            <span>Ranking Game</span>
            <MyButton
              message="start game"
              color="green"
              onClick={() => setGameStarted(true)}
            />
          </div> */}
        </div>
      )}

      {gameStarted && (
        <Suspense fallback={<Loading />}>
          <RankingGameContent />
        </Suspense>
      )}
    </div>
  );
}
