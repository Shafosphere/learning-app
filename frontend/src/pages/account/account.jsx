import "./account.css";
import React, { useEffect, useState, useContext } from "react";
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

import { useWindowWidth } from "../../components/window_width/windowWidth";

export default function Account() {
  const windowWidth = useWindowWidth();
  const navigate = useNavigate();

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
  // const [activeSpan, setSpan] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const { setPopup } = useContext(PopupContext);

  const avatarImages = {
    1: avatar1,
    2: avatar2,
    3: avatar3,
    4: avatar4,
  };

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
          message: "Account has been deleted :(",
          emotion: "positive",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setPopup({
          message: "Failed to delete account.",
          emotion: "warning",
        });
      }
    } catch (error) {
      console.error(error);
      setPopup({
        message: "An error occurred.",
        emotion: "negative",
      });
    }
  }

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.post("/auth/information");
        const data = response.data;
        setUserData((prevData) => ({
          ...prevData,
          username: data.username,
          email: data.email,
          avatar: data.avatar,
        }));
      } catch (error) {
        console.error(error);
      }
    }
    getData();
  }, []);

  const handleChange = (field, value) => {
    setUserData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setEditedData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setIsButtonDisabled(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await api.patch("/auth/update", editedData);
      if (response.data.success) {
        setPopup({
          message: "Changes saved successfully!",
          emotion: "positive",
        });
        setEditedData({});
        setIsButtonDisabled(true);
      } else {
        setPopup({
          message: "Failed to save changes.",
          emotion: "warning",
        });
      }
    } catch (error) {
      console.log(error);
      setPopup({
        message: "An error occurred.",
        emotion: "negative",
      });
    }
  };

  const inputFields = [
    {
      label: "Username",
      field: "username",
      type: "text",
    },
    {
      label: "Email Address",
      field: "email",
      type: "email",
    },
    {
      label: "Old Password",
      field: "oldPass",
      type: showPassword ? "text" : "password",
      isPassword: true,
    },
    {
      label: "New Password",
      field: "newPass",
      type: showPassword ? "text" : "password",
      isPassword: true,
    },
    {
      label: "Confirm New Password",
      field: "confirmPass",
      type: showPassword ? "text" : "password",
      isPassword: true,
    },
  ];

  const handleAvatarChange = (direction) => {
    setUserData((prevData) => {
      let newAvatar;
      if (direction === "left") {
        newAvatar = prevData.avatar === 1 ? 4 : prevData.avatar - 1;
      } else if (direction === "right") {
        newAvatar = prevData.avatar === 4 ? 1 : prevData.avatar + 1;
      }
      setEditedData((prevEditedData) => ({
        ...prevEditedData,
        avatar: newAvatar,
      }));
      setIsButtonDisabled(false);
      return {
        ...prevData,
        avatar: newAvatar,
      };
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

        {(activePage === "1" || windowWidth >= 769) && (
          <div className="account-left">
            <div className="account-input-container">
              {inputFields.map((input) => (
                <div className="input-group" key={input.field}>
                  <span
                    // onMouseEnter={() => setSpan(input.field)}
                    className="account-text"
                  >
                    {input.label}
                  </span>
                  <div
                    className={
                      input.isPassword ? "custom_input-acc" : undefined
                    }
                    style={{ position: "relative" }}
                  >
                    <input
                      // onMouseEnter={() => setSpan(input.field)}
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

            <div
              // onMouseEnter={() => setSpan("buttons")}
              className="account-buttons"
            >
              <MyButton
                message="DELETE ACCOUNT"
                color="red"
                onClick={() =>
                  showConfirm(
                    "Are you sure you want to delete your account?",
                    deleteAccount
                  )
                }
              />

              <MyButton
                message="SAVE CHANGES"
                color="green"
                onClick={() =>
                  showConfirm(
                    "Czy chcesz zaktualizować swoje dane?",
                    handleSubmit
                  )
                }
                disabled={isButtonDisabled}
              />
            </div>
          </div>
        )}

        {(activePage === "2" || windowWidth >= 769) && (
          <div className="account-right">
            <div className="avatar-container">
              <span
                // onMouseEnter={() => setSpan("avatar")}
                className="account-text"
              >
                Avatar
              </span>
              <div
                className="avatar-slider"
                // onMouseEnter={() => setSpan("avatar")}
              >
                <img
                  alt="avatar"
                  className="avatarIMG"
                  src={avatarImages[userData.avatar]}
                  // onMouseEnter={() => setSpan("avatar")}
                />
                <div className="arrows-container-account">
                  <button
                    className="avatar-arrow"
                    // onMouseEnter={() => setSpan("avatar")}
                    onClick={() => handleAvatarChange("left")}
                  >
                    <MdArrowBack size={30} />
                  </button>
                  <button
                    className="avatar-arrow"
                    // onMouseEnter={() => setSpan("avatar")}
                    onClick={() => handleAvatarChange("right")}
                  >
                    <MdArrowForward size={30} />
                  </button>
                </div>
              </div>
            </div>

            {/* <div className="explanation-account">
              <span
                className={`${
                  activeSpan === "avatar" ? "" : "hide-span-account"
                }`}
              >
                Zmień swój avatar
              </span>
            </div> */}
          </div>
        )}
      </div>
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}
