import { useEffect, useState } from "react";
import styles from "./ranking.module.css";
import api from "../../utils/api";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "../../components/loading/loading";
import gold from "../../data/medal/gold.png";
import silver from "../../data/medal/silver.png";
import bronze from "../../data/medal/bronze.png";

import avatar1 from "../../data/avatars/man.png";
import avatar2 from "../../data/avatars/man_1.png";
import avatar3 from "../../data/avatars/woman.png";
import avatar4 from "../../data/avatars/woman_1.png";

export default function RankingContent() {
  const [data, setData] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  // Mapa awatarów
  const avatarImages = {
    1: avatar1,
    2: avatar2,
    3: avatar3,
    4: avatar4,
  };

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
          <table>
            <thead className={styles.tablehead}>
              <tr className={styles.rowhead}>
                <th>Position</th>
                <th>Nickname</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                let medal = null;

                if (index === 0) {
                  medal = (
                    <img
                      alt="gold_medal"
                      className={`${styles.gold} ${styles.medal}`}
                      src={gold}
                    />
                  );
                } else if (index === 1) {
                  medal = (
                    <img
                      alt="silver_medal"
                      className={`${styles.silver} ${styles.medal}`}
                      src={silver}
                    />
                  );
                } else if (index === 2) {
                  medal = (
                    <img
                      alt="bronze_medal"
                      className={`${styles.bronze} ${styles.medal}`}
                      src={bronze}
                    />
                  );
                }

                return (
                  <tr
                    key={item.id}
                    className={`${styles.row} ${
                      index === 0 ? styles.firstrow : ""
                    }`}
                  >
                    <td>
                      {index + 1}.{medal && medal}
                    </td>
                    <td>
                      <div className={styles.userInfo}>
                        <div>
                          <img
                            alt="avatar"
                            className={styles.avatar}
                            src={avatarImages[item.avatar]}
                          />
                        </div>
                        <div>{item.username}</div>
                      </div>
                    </td>

                    <td>{item.weekly_points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  );
}
