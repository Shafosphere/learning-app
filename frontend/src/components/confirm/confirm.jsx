import styles from "./confirm.module.css";
import React, { useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import MyButton from "../button/button";

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
        <MyButton
          message={intl.formatMessage({
            id: "confirm.no",
            defaultMessage: "No",
          })}
          color="red"
          onClick={() => handleClose(false)}
        />

        <MyButton
          message={intl.formatMessage({
            id: "confirm.yes",
            defaultMessage: "Yes",
          })}
          color="green"
          onClick={() => handleClose(true)}
        />
      </div>
    </dialog>
  );
}
