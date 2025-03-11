import React, { Suspense } from "react";
import Loading from "../../components/loading/loading";

const RrankingTableContent = React.lazy(() =>
  import("../../components/rankingtable/rankingtablecontent")
);

export default function RankingTable() {
  return (
    <Suspense fallback={<Loading />}>
      <RrankingTableContent />
    </Suspense>
  );
}
