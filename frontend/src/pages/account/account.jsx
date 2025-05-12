import "./account.css";
import React, { useEffect, useState, useContext } from "react";
import { useIntl, FormattedMessage } from "react-intl";
import api from "../../utils/api";
import ConfirmWindow from "../../components/confirm/confirm";
import {
  MdOutlineLock,
  MdOutlineLockOpen,
  MdArrowBack,
  MdArrowForward,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { PopupContext } from "../../components/popup/popupcontext";
import MyButton from "../../components/button/button";
import avatar1 from "../../data/avatars/man.png";
import avatar2 from "../../data/avatars/man_1.png";
import avatar3 from "../../data/avatars/woman.png";
import avatar4 from "../../data/avatars/woman_1.png";

import { useWindowWidth } from "../../hooks/window_width/windowWidth";

export default function Account() {
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();
  const intl = useIntl(); // Hook for handling translations

  const [userData, setUserData] = useState({
    username: "",
    email: "",
    oldPass: "",
    newPass: "",
    confirmPass: "",
    avatar: null,
  });

  const [activePage, setPage] = useState("1");
  const [editedData, setEditedData] = useState({});
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const { setPopup } = useContext(PopupContext);

  const avatarImages = { 1: avatar1, 2: avatar2, 3: avatar3, 4: avatar4 };

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
      const response = await api.delete("/auth/delete");
      if (response.data.success) {
        setPopup({
          message: intl.formatMessage({
            id: "account.delete.success",
            defaultMessage: "Account has been deleted :(",
          }),
          emotion: "positive",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopup({
          message: intl.formatMessage({
            id: "account.delete.failure",
            defaultMessage: "Failed to delete account.",
          }),
          emotion: "warning",
        });
      }
    } catch (error) {
      console.error(error);
      setPopup({
        message: intl.formatMessage({
          id: "account.generalError",
          defaultMessage: "An error occurred.",
        }),
        emotion: "negative",
      });
    }
  }

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await api.post("/auth/information");
        const data = response.data;
        setUserData((prev) => ({
          ...prev,
          username: data.username,
          email: data.email,
          avatar: data.avatar,
        }));
      } catch (error) {
        console.error(error);
      }
    }
    fetchUserData();
  }, []);

  const handleChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    setEditedData((prev) => ({ ...prev, [field]: value }));
    setIsButtonDisabled(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.patch("/auth/update", editedData);
      if (response.data.success) {
        setPopup({
          message: intl.formatMessage({
            id: "account.save.success",
            defaultMessage: "Changes saved successfully!",
          }),
          emotion: "positive",
        });
        setEditedData({});
        setIsButtonDisabled(true);
      } else {
        setPopup({
          message: intl.formatMessage({
            id: "account.save.failure",
            defaultMessage: "Failed to save changes.",
          }),
          emotion: "warning",
        });
      }
    } catch (error) {
      console.error(error);
      setPopup({
        message: intl.formatMessage({
          id: "account.generalError",
          defaultMessage: "An error occurred.",
        }),
        emotion: "negative",
      });
    }
  };

  // Definition of input fields
  const inputFields = [
    {
      labelId: "account.field.username",
      defaultMessage: "Username",
      field: "username",
      type: "text",
      isPassword: false,
    },
    {
      labelId: "account.field.email",
      defaultMessage: "Email Address",
      field: "email",
      type: "email",
      isPassword: false,
    },
    {
      labelId: "account.field.oldPass",
      defaultMessage: "Old Password",
      field: "oldPass",
      type: showPassword ? "text" : "password",
      isPassword: true,
    },
    {
      labelId: "account.field.newPass",
      defaultMessage: "New Password",
      field: "newPass",
      type: showPassword ? "text" : "password",
      isPassword: true,
    },
    {
      labelId: "account.field.confirmPass",
      defaultMessage: "Confirm New Password",
      field: "confirmPass",
      type: showPassword ? "text" : "password",
      isPassword: true,
    },
  ];

  const handleAvatarChange = (direction) => {
    setUserData((prev) => {
      let newAvatar;
      if (direction === "left") {
        newAvatar = prev.avatar === 1 ? 4 : prev.avatar - 1;
      } else {
        newAvatar = prev.avatar === 4 ? 1 : prev.avatar + 1;
      }
      setEditedData((prevEdited) => ({ ...prevEdited, avatar: newAvatar }));
      setIsButtonDisabled(false);
      return { ...prev, avatar: newAvatar };
    });
  };

  return (
    <div className="container-account">
      <div className="window-account">
        <div className="pageNumbers-account">
          <div
            onClick={() => setPage("1")}
            className={
              activePage === "1" ? "tab-account-active" : "tab-account"
            }
          >
            1
          </div>
          <div
            onClick={() => setPage("2")}
            className={
              activePage === "2" ? "tab-account-active" : "tab-account"
            }
          >
            2
          </div>
        </div>

        {/* Show left panel on page 1 or wide screens */}
        {(activePage === "1" || windowWidth >= 769) && (
          <div className="account-left">
            <div className="account-input-container">
              {inputFields.map((input) => (
                <div className="input-group" key={input.field}>
                  <span className="account-text">
                    <FormattedMessage
                      id={input.labelId}
                      defaultMessage={input.defaultMessage}
                    />
                  </span>
                  <div
                    className={
                      input.isPassword ? "custom_input-acc" : undefined
                    }
                    style={{ position: "relative" }}
                  >
                    <input
                      onChange={(e) =>
                        handleChange(input.field, e.target.value)
                      }
                      className={
                        input.isPassword
                          ? "account-input"
                          : "account-input-fullborder"
                      }
                      type={input.type}
                      value={userData[input.field]}
                    />
                    {input.isPassword && (
                      <button
                        type="button"
                        className="btn-pass-acc"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <MdOutlineLockOpen className="icon-lock-account" />
                        ) : (
                          <MdOutlineLock className="icon-lock-account" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="account-buttons">
              <MyButton
                message={intl.formatMessage({
                  id: "account.button.delete",
                  defaultMessage: "DELETE ACCOUNT",
                })}
                color="red"
                onClick={() =>
                  showConfirm(
                    intl.formatMessage({
                      id: "account.confirm.delete",
                      defaultMessage:
                        "Are you sure you want to delete your account?",
                    }),
                    deleteAccount
                  )
                }
              />

              <MyButton
                message={intl.formatMessage({
                  id: "account.button.save",
                  defaultMessage: "SAVE CHANGES",
                })}
                color="green"
                onClick={() =>
                  showConfirm(
                    intl.formatMessage({
                      id: "account.confirm.update",
                      defaultMessage: "Do you want to update your data?",
                    }),
                    handleSubmit
                  )
                }
                disabled={isButtonDisabled}
              />
            </div>
          </div>
        )}

        {/* Show right panel on page 2 or wide screens */}
        {(activePage === "2" || windowWidth >= 769) && (
          <div className="account-right">
            <div className="avatar-container">
              <span className="account-text">
                <FormattedMessage
                  id="account.field.avatar"
                  defaultMessage="Avatar"
                />
              </span>
              <div className="avatar-slider">
                <img
                  alt="avatar"
                  className="avatarIMG"
                  src={avatarImages[userData.avatar]}
                />
                <div className="arrows-container-account">
                  <button
                    className="avatar-arrow"
                    onClick={() => handleAvatarChange("left")}
                  >
                    <MdArrowBack size={30} />
                  </button>
                  <button
                    className="avatar-arrow"
                    onClick={() => handleAvatarChange("right")}
                  >
                    <MdArrowForward size={30} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}
