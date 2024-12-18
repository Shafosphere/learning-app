import React from "react";
import styles from "./empty.module.css";
import NewProgressBar from "../../components/progress_bar/progressbar";

export default function Empty() {
  return (
    <div className={styles.cointainer}>
      <div className={styles.test}>
        <NewProgressBar percent={40} text="Loading..." />
      </div>
    </div>
  );
}
