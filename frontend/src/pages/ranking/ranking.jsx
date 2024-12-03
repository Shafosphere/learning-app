import React, { Suspense } from "react";
import Loading from "../../components/loading/loading";

const RankingContent = React.lazy(() => import("../../components/ranking/rankingcontent"));

export default function Ranking() {
  return (
    <Suspense fallback={<Loading />}>
      <RankingContent />
    </Suspense>
  );
}
