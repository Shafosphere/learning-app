import React from "react";
import styles from "./smallButtons.module.css";
import { MdOutlineRestartAlt } from "react-icons/md";

export default function SmallButtons({ setResults }) {
  return (
    <div className={styles.container}>
      <button
        onClick={() => setResults("good")}
        className={`${styles.button} ${styles.turquoise}`}
      ></button>
      <button className={`${styles.button} ${styles.yellow}`}>
        <MdOutlineRestartAlt />
      </button>
      <button
        onClick={() => setResults("wrong")}
        className={`${styles.button} ${styles.pink}`}
      ></button>
    </div>
  );
}
