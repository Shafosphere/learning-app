import React, { Suspense } from "react";
import Loading from "../../components/loading/loading";

const RankingGameContent = React.lazy(() =>
  import("../../components/rankinggame/rankinggame")
);

export default function RankingGame() {
  return (
    <Suspense fallback={<Loading />}>
      <RankingGameContent />
    </Suspense>
  );
}
