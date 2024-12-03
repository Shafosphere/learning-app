import { useEffect, useState } from "react";
import styles from "./ranking.module.css";
import api from "../../utils/api";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "../../components/loading/loading";

export default function RankingContent() {
  const [data, setData] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        const newData = await api.get("/user/ranking");
        setData(newData.data);
        setHasMore(false);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
      }
    }
    getData();
  }, []);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <InfiniteScroll
          className={styles.table}
          dataLength={data.length}
          hasMore={hasMore}
          loader={<Loading />}
          endMessage={<div></div>}
          scrollableTarget="scrollableDiv"
        >
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th>position</th>
                <th>nickname</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) =>
                index === 0 ? (
                  <tr
                    key={item.id}
                    className={`${styles.firstrow} ${styles.row}`}
                  >
                    <td>{index + 1}</td>
                    <td>{item.username}</td>
                    <td>{item.weekly_points}</td>
                  </tr>
                ) : (
                  <tr className={styles.row} key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.username}</td>
                    <td>{item.weekly_points}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  );
}
