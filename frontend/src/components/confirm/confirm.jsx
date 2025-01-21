import styles from "./confirm.module.css";
import React, { useRef, useEffect } from "react";
import { useIntl } from "react-intl";

export default function ConfirmWindow({ message, onClose }) {
  const confirmRef = useRef(null);
  const intl = useIntl();

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
    onClose(result);
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
          {intl.formatMessage({ id: "confirm.no", defaultMessage: "No" })}
        </button>
        <button
          style={{ "--buttonColor": "var(--highlight)" }}
          className="button"
          onClick={() => handleClose(true)}
        >
          {intl.formatMessage({ id: "confirm.yes", defaultMessage: "Yes" })}
        </button>
      </div>
    </dialog>
  );
}
