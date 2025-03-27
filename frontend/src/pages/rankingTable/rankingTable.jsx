import React, { Suspense } from "react";
import Loading from "../../components/loading/loading";

const RankingTableContent = React.lazy(() =>
  import("../../components/rankingtable/rankingtablecontent")
);

export default function RankingTable() {
  return (
    <Suspense fallback={<Loading />}>
      <RankingTableContent />
    </Suspense>
  );
}
