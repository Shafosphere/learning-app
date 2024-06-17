import styles from "./confirm.module.css";
import React, { useRef, useEffect } from "react";

export default function ConfirmWindow({ message, onClose }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    const dialogElement = confirmRef.current;
    if (dialogElement) {
      dialogElement.showModal();
    }
  }, []);

const handleClose = (result) => {
  const dialogElement = confirmRef.current;
  if (dialogElement) {
    dialogElement.close();
  }
  onClose(result); // Przekazywanie wyniku
};

  return (
    <dialog ref={confirmRef} className={styles.confirm}>
      <p>{message}</p>
      <div className={styles.buttons}>
        <button
          style={{ "--buttonColor": "var(--secondary)" }}
          className="button"
          onClick={() => handleClose(false)}
        >
          No
        </button>
        <button
          style={{ "--buttonColor": "var(--highlight)" }}
          className="button"
          onClick={() => handleClose(true)}
        >
          Yes
        </button>
      </div>
    </dialog>
  );
}
