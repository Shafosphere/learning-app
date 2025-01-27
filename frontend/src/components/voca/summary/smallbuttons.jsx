import React, { useState } from "react";
import styles from "./smallButtons.module.css";
import { MdOutlineRestartAlt } from "react-icons/md";
import ConfirmWindow from "../../confirm/confirm";
import { useIntl } from "react-intl";

export default function SmallButtons({ setResults, resetProgress, lvl }) {
  // confirm
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const intl = useIntl();

  const handleConfirmClose = (result) => {
    if (result && confirmCallback) {
      confirmCallback();
    }
    setConfirmMessage("");
    setConfirmCallback(null);
  };

  function showConfirm(text, callback) {
    setConfirmMessage(text);
    setConfirmCallback(() => callback);
  }

  return (
    <>
      <div className={styles.container}>
        <button
          onClick={() => setResults("good")}
          className={`${styles.button} ${styles.turquoise}`}
        ></button>
        <button
          onClick={() =>
            showConfirm(
              intl.formatMessage(
                {
                  id: "areYouSureResetProgressVoca",
                  defaultMessage:
                    "This will delete all your progress on this level. Are you sure?",
                },
                { lvl }
              ),
              () => resetProgress(lvl)
            )
          }
          className={`${styles.button} ${styles.yellow}`}
        >
          <MdOutlineRestartAlt />
        </button>
        <button
          onClick={() => setResults("wrong")}
          className={`${styles.button} ${styles.pink}`}
        ></button>
      </div>
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </>
  );
}
