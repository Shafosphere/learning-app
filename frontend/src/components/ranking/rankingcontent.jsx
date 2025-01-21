import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
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

  const intl = useIntl();

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
        console.error(
          intl.formatMessage({
            id: "ranking.error",
            defaultMessage: "Error fetching ranking data:",
          }),
          error
        );
      }
    }
    getData();
  }, [intl]);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <InfiniteScroll
          dataLength={data.length}
          hasMore={hasMore}
          loader={<Loading />}
          endMessage={<div></div>}
          scrollableTarget="scrollableDiv"
        >
          <table>
            <thead className={styles.tablehead}>
              <tr className={styles.rowhead}>
                <th>
                  <FormattedMessage
                    id="ranking.position"
                    defaultMessage="Position"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="ranking.nickname"
                    defaultMessage="Nickname"
                  />
                </th>
                <th>
                  <FormattedMessage
                    id="ranking.points"
                    defaultMessage="Points"
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => {
                let medal = null;

                if (index === 0) {
                  medal = (
                    <img
                      alt={intl.formatMessage({
                        id: "ranking.medal.gold",
                        defaultMessage: "Gold medal",
                      })}
                      className={`${styles.gold} ${styles.medal}`}
                      src={gold}
                    />
                  );
                } else if (index === 1) {
                  medal = (
                    <img
                      alt={intl.formatMessage({
                        id: "ranking.medal.silver",
                        defaultMessage: "Silver medal",
                      })}
                      className={`${styles.silver} ${styles.medal}`}
                      src={silver}
                    />
                  );
                } else if (index === 2) {
                  medal = (
                    <img
                      alt={intl.formatMessage({
                        id: "ranking.medal.bronze",
                        defaultMessage: "Bronze medal",
                      })}
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
                            alt={intl.formatMessage({
                              id: "ranking.user.avatar",
                              defaultMessage: "Avatar",
                            })}
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
