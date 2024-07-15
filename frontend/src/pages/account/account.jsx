import "./account.css";
import Popup from "../../components/popup/popup";
import React, { useEffect, useRef, useState } from "react";
import api from "../../utils/api";

export default function Account() {
  const username = useRef(null);
  const email = useRef(null);
  const oldPass = useRef(null);
  const newPass = useRef(null);
  const confirmPass = useRef(null);

  const OldUsername = useRef(null);
  const OldEmail = useRef(null);

  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // popup
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");

  // span management
  const [activeSpan, setSpan] = useState("");

  function buttonStatus() {
    if (
      username.current &&
      email.current &&
      oldPass.current &&
      newPass.current &&
      confirmPass.current &&
      (username.current.value !== OldUsername.current.value ||
        email.current.value !== OldEmail.current.value ||
        oldPass.current.value !== "" ||
        newPass.current.value !== "" ||
        confirmPass.current.value !== "")
    ) {
      setIsButtonDisabled(false);
    } else {
      setIsButtonDisabled(true);
    }
  }

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.post("/account-data");
        const data = response.data;
        username.current.value = data.username;
        email.current.value = data.email;
        OldUsername.current = { value: data.username };
        OldEmail.current = { value: data.email };
      } catch (error) {
        console.error(error);
      }
    }
    getData();
  }, []);

  async function updateData() {
    try {
      const response = await api.patch("/account-update", {});
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="container-settings">
      <div className="window-settings">
        <div className="settings-left">
          <div className="account-input-container">
            <span
              onMouseEnter={() => setSpan("username")}
              className="account-text"
            >
              Username
            </span>
            <input
              onMouseEnter={() => setSpan("username")}
              onChange={buttonStatus}
              className="account-input"
              type="text"
              ref={username}
            />
            <span
              onMouseEnter={() => setSpan("email")}
              className="account-text"
            >
              Email Address
            </span>
            <input
              onMouseEnter={() => setSpan("email")}
              onChange={buttonStatus}
              className="account-input"
              type="email"
              ref={email}
            />
            <span
              onMouseEnter={() => setSpan("password")}
              className="account-text"
            >
              Old Password
            </span>
            <input
              onMouseEnter={() => setSpan("password")}
              autoComplete="current-password"
              name="password"
              type="password"
              className="account-input"
              ref={oldPass}
              onChange={buttonStatus}
            />
            <span
              onMouseEnter={() => setSpan("password")}
              className="account-text"
            >
              New Password
            </span>
            <input
              onMouseEnter={() => setSpan("password")}
              autoComplete="current-password"
              name="password"
              type="password"
              className="account-input"
              ref={newPass}
              onChange={buttonStatus}
            />
            <span
              onMouseEnter={() => setSpan("password")}
              className="account-text"
            >
              Confirm New Password
            </span>
            <input
              onMouseEnter={() => setSpan("password")}
              className="account-input"
              autoComplete="current-password"
              name="password"
              type="password"
              ref={confirmPass}
              onChange={buttonStatus}
            />
          </div>
          <div
            onMouseEnter={() => setSpan("buttons")}
            className="account-buttons"
          >
            <button
              style={{ "--buttonColor": "var(--secondary)" }}
              className="button"
              // onClick={deleteAccount}
            >
              DELETE ACCOUNT
            </button>

            <button
              style={{ "--buttonColor": "var(--highlight)" }}
              className="button"
              onClick={updateData}
              disabled={isButtonDisabled}
            >
              SAVE CHANGES
            </button>
          </div>
        </div>

        {/* descriptions */}
        <div className="settings-right">
          <div className="explanation">
          <span
              className={`${activeSpan === "username" ? "" : "hide-span-sett"}`}
            >
              zmień swój nickname
            </span>
            <span
              className={`${activeSpan === "email" ? "" : "hide-span-sett"}`}
            >
              zmien swój email
            </span>
            <span
              className={`${activeSpan === "password" ? "" : "hide-span-sett"}`}
            >
              zmień swoje hasło
            </span>
            <span
              className={`${activeSpan === "buttons" ? "" : "hide-span-sett"}`}
            >
              <p>delete account - usun konto</p>
              save changes - zapisz zmiany
            </span>
          </div>
        </div>
      </div>
      {popupMessage && (
        <Popup
          message={popupMessage}
          emotion={popupEmotion}
          onClose={() => setPopupMessage("")}
        />
      )}
      {/* {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )} */}
    </div>
  );
}
