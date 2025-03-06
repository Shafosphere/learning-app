import styles from "./confirm.module.css";
import React, { useRef, useEffect } from "react";
import { useIntl } from "react-intl";
import MyButton from "../button/button";

export default function ConfirmWindow({
  conflict = false,
  localDate,
  serverDate,
  onClose,
  message,
}) {
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

  return conflict ? (
    <dialog ref={confirmRef} className={styles.conflictConfirm}>
      <div className={styles.conflictContent}>
        <h2 className={styles.conflictTitle}>
          {intl.formatMessage({
            id: "confirm.conflictTitle",
            defaultMessage: "Different save versions!",
          })}
        </h2>
        <p className={styles.conflictMessage}>
          {intl.formatMessage(
            {
              id: "confirm.conflictMessage",
              defaultMessage:
                "You have a {newer} save from this computer ({localDate}) and an {older} save from your account ({serverDate}). Clicking {yes} will use the newer local save, while clicking {no} will keep the save from your account.",
            },
            {
              newer: (
                <span className={styles.conflictYes}>
                  {intl.formatMessage({
                    id: "confirm.newer",
                    defaultMessage: "newer",
                  })}
                </span>
              ),
              localDate: (
                <span className={styles.conflictYes}>{localDate}</span>
              ),
              older: (
                <span className={styles.conflictNo}>
                  {intl.formatMessage({
                    id: "confirm.older",
                    defaultMessage: "older",
                  })}
                </span>
              ),
              serverDate: (
                <span className={styles.conflictNo}>{serverDate}</span>
              ),
              yes: (
                <span className={styles.conflictYes}>
                  {intl.formatMessage({
                    id: "confirm.yes",
                    defaultMessage: "Yes",
                  })}
                </span>
              ),
              no: (
                <span className={styles.conflictNo}>
                  {intl.formatMessage({
                    id: "confirm.no",
                    defaultMessage: "No",
                  })}
                </span>
              ),
            }
          )}
        </p>
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
      </div>
    </dialog>
  ) : (
    <dialog ref={confirmRef} className={styles.confirm}>
      <p className={styles.regularMessage}>{message}</p>
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
