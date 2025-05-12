import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import styles from "./ranking.module.css";
import api from "../../utils/api";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "../loading/loading";

// Medal images
import gold from "../../data/medal/gold.png";
import silver from "../../data/medal/silver.png";
import bronze from "../../data/medal/bronze.png";

// Avatar images
import avatar1 from "../../data/avatars/man.png";
import avatar2 from "../../data/avatars/man_1.png";
import avatar3 from "../../data/avatars/woman.png";
import avatar4 from "../../data/avatars/woman_1.png";

// Icon imports (remember to add data-testid)
import { FaTrophy } from "react-icons/fa";
import { FaBoxOpen } from "react-icons/fa6";

export default function RankingTableContent({ setDisplay, lvl }) {
  const [data, setData] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const intl = useIntl();

  // Map of avatars by id
  const avatarImages = { 1: avatar1, 2: avatar2, 3: avatar3, 4: avatar4 };

  useEffect(() => {
    async function getData() {
      try {
        // Choose endpoint based on level
        const endpoint =
          lvl === "Flashcards"
            ? "/user/ranking-flashcard"
            : "/user/ranking-arena";

        const response = await api.get(endpoint);
        setData(response.data);
        setHasMore(false);
      } catch (error) {
        console.error(
          intl.formatMessage({
            id: "ranking.error",
            defaultMessage: "Error loading ranking",
          }),
          error
        );
      }
    }

    getData();
  }, [intl, lvl]);

  if (!data) {
    return <Loading />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.window}>
        <h1 className={styles.title}>
          <FormattedMessage
            id={`${lvl}table.title`}
            defaultMessage={`${lvl}table.title`}
          />
        </h1>
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
                      {index + 1}.{medal}
                    </td>
                    <td>
                      <div className={styles.userInfo}>
                        <img
                          alt={intl.formatMessage({
                            id: "ranking.user.avatar",
                            defaultMessage: "User avatar",
                          })}
                          className={styles.avatar}
                          src={avatarImages[item.avatar]}
                        />
                        <span>{item.username}</span>
                      </div>
                    </td>
                    <td>{item.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
      <div className="return-btn-voca" onClick={() => setDisplay("default")}>
        <h1>
          {lvl === "Flashcards" ? (
            <FaBoxOpen data-testid="FaBoxOpen" />
          ) : (
            <FaTrophy data-testid="FaTrophy" />
          )}
        </h1>
      </div>
    </div>
  );
}
