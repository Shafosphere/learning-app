import "./account.css";
import Popup from "../../components/popup/popup";
import React, { useEffect, useRef, useState } from "react";
import api from "../../utils/api";
import ConfirmWindow from "../../components/confirm/confirm";
import { MdOutlineLock, MdOutlineLockOpen } from "react-icons/md";
import { useNavigate } from 'react-router-dom';


export default function Account() {
  const navigate = useNavigate();

  const username = useRef(null);
  const email = useRef(null);
  const oldPass = useRef(null);
  const newPass = useRef(null);
  const confirmPass = useRef(null);

  const [initialData, setInitialData] = useState({});
  const [editedData, setEditedData] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  const [showPassword, setShowPassword] = useState(false);

  // popup
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");

  // span management
  const [activeSpan, setSpan] = useState("");

  // confirm
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

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

  async function deleteAccount() {
    try {
      const response = await api.delete('/delete-account');
      if (response.data.success) {
        setPopupMessage('Accound has been deleted :(');
        setPopupEmotion('positive');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setPopupMessage('Failed to delete account.');
        setPopupEmotion('warning');
      }
    } catch (error) {
      console.error(error);
      setPopupMessage('An error occurred.');
      setPopupEmotion('negative');
    }
  } 

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.post("/account-data");
        const data = response.data;
        username.current.value = data.username;
        email.current.value = data.email;
        setInitialData(data);
      } catch (error) {
        console.error(error);
      }
    }
    getData();
  }, []);

  const handleChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setIsButtonDisabled(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.patch("/account-update", editedData);
      if (response.data.success) {
        setPopupMessage("Changes saved successfully!");
        setPopupEmotion("positive");
      } else {
        setPopupMessage("Failed to save changes.");
        setPopupEmotion("warning");
      }
    } catch (error) {
      console.log(error);
      setPopupMessage("An error occurred.");
      setPopupEmotion("negative");
    }
  };

  return (
    <div className="container-settings">
      <div className="window-settings">
        <div className="settings-left">
          <div className="account-input-container">
            <div className="input-group">
              <span
                onMouseEnter={() => setSpan("username")}
                className="account-text"
              >
                Username
              </span>
              <input
                onMouseEnter={() => setSpan("username")}
                onChange={(e) => handleChange("username", e.target.value)}
                className="account-input account-top-input"
                type="text"
                ref={username}
              />
            </div>

            <div className="input-group">
              <span
                onMouseEnter={() => setSpan("email")}
                className="account-text"
              >
                Email Address
              </span>
              <input
                onMouseEnter={() => setSpan("email")}
                onChange={(e) => handleChange("email", e.target.value)}
                className="account-input account-top-input"
                type="email"
                ref={email}
              />
            </div>

            <div className="input-group">
              <span
                onMouseEnter={() => setSpan("password")}
                className="account-text"
              >
                Old Password
              </span>
              <div
                className="custom_input-acc"
                style={{ position: "relative" }}
              >
                <input
                  onMouseEnter={() => setSpan("password")}
                  autoComplete="current-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="account-input"
                  ref={oldPass}
                  onChange={(e) => handleChange("oldPass", e.target.value)}
                />
                <button
                  type="button"
                  className="btn-pass-acc"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <MdOutlineLockOpen size={30} />
                  ) : (
                    <MdOutlineLock size={30} />
                  )}
                </button>
              </div>
            </div>

            <div className="input-group">
              <span
                onMouseEnter={() => setSpan("password")}
                className="account-text"
              >
                New Password
              </span>
              <div
                className="custom_input-acc"
                style={{ position: "relative" }}
              >
                <input
                  onMouseEnter={() => setSpan("password")}
                  autoComplete="current-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="account-input"
                  ref={newPass}
                  onChange={(e) => handleChange("newPass", e.target.value)}
                />
                <button
                  type="button"
                  className="btn-pass-acc"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <MdOutlineLockOpen size={30} />
                  ) : (
                    <MdOutlineLock size={30} />
                  )}
                </button>
              </div>
            </div>

            <div className="input-group">
              <span
                onMouseEnter={() => setSpan("password")}
                className="account-text"
              >
                Confirm New Password
              </span>
              <div
                className="custom_input-acc"
                style={{ position: "relative" }}
              >
                <input
                  onMouseEnter={() => setSpan("password")}
                  autoComplete="current-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="account-input"
                  ref={confirmPass}
                  onChange={(e) => handleChange("confirmPass", e.target.value)}
                />
                <button
                  type="button"
                  className="btn-pass-acc"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <MdOutlineLockOpen size={30} />
                  ) : (
                    <MdOutlineLock size={30} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div
            onMouseEnter={() => setSpan("buttons")}
            className="account-buttons"
          >
            <button
              style={{ "--buttonColor": "var(--secondary)" }}
              className="button"
              onClick={() =>
                showConfirm(
                  "Are you sure you want to delete your account?",
                  deleteAccount
                )
              }
            >
              DELETE ACCOUNT
            </button>

            <button
              style={{ "--buttonColor": "var(--highlight)" }}
              className="button"
              onClick={() =>
                showConfirm(
                  "Czy chcesz zaktualizowac swoje dane?",
                  handleSubmit
                )
              }
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
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}
