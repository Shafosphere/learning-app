import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { LuMenuSquare } from "react-icons/lu";
import { FaGithub } from "react-icons/fa";
import { IoMdHome, IoMdSettings } from "react-icons/io";
import { MdAccountBox, MdLogin } from "react-icons/md";
import { MdAdminPanelSettings } from "react-icons/md";
import { FormattedMessage, useIntl } from "react-intl";
import api from "../../utils/api";
import Popup from "../popup/popup";
import { SettingsContext } from "../../pages/settings/properties";
import "./sidebar.css";

export default function Sidebar() {
  const { isLoggedIn, setIsLoggedIn, user, setUser } = useContext(SettingsContext);

  const [isAdmin, setIsAdmin] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");
  const intl = useIntl();

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const response = await api.get("/admin");
        if (response.data && response.data.success) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.log(error);
        setIsAdmin(false);
      }
    };

    if (isLoggedIn) {
      checkAdminRole();
    }
  }, [isLoggedIn]);

  const handleDivClick = (event) => {
    const link = event.currentTarget.querySelector("a");
    if (link) {
      link.click();
    }
  };

  const logout = async () => {
    try {
      await api.post("/logout");
      setIsLoggedIn(false);
      setUser(null);
      setPopupEmotion("positive");
      setPopupMessage(
        intl.formatMessage({
          id: "logoutSuccessful",
          defaultMessage: "Logout successful",
        })
      );
    } catch (error) {
      console.error("Logout error:", error);
      setPopupEmotion("negative");
      setPopupMessage(
        intl.formatMessage({
          id: "logoutError",
          defaultMessage: "An error occurred during logout",
        })
      );
    }
  };

  return (
    <>
      <div className="container-sidebar">
        <div className="small-sidebar">
          <LuMenuSquare />
        </div>
        <div className="big-sidebar">
          <div className="title-sidebar">
            <span>Memolingo</span>
          </div>
          <div className="links-sidebar">
            <div className="links-container">
              <div className="one" onClick={handleDivClick}>
                <Link to="/home">
                  <IoMdHome />
                </Link>
              </div>
              <div className="two" onClick={handleDivClick}>
                <Link to="/settings">
                  <IoMdSettings />
                </Link>
              </div>
              <div className="three" onClick={handleDivClick}>
                <Link to="/login">
                  <MdAccountBox />
                </Link>
              </div>
              {isAdmin && (
                <div className="four" onClick={handleDivClick}>
                  <Link to="/admin">
                    <MdAdminPanelSettings />
                  </Link>
                </div>
              )}
              <div className="five" onClick={handleDivClick}></div>
              <div className="six" onClick={handleDivClick}></div>
              <div className="seven" onClick={handleDivClick}></div>
              <div className="eight" onClick={handleDivClick}></div>
              <div className="nine" onClick={handleDivClick}></div>
            </div>
          </div>
          <div className="btn-container">
            {isLoggedIn && (
              <div onClick={logout} className="logout-button">
                <span>Hi! {user.username} </span>
                <MdLogin className="logout-icon" />
                <div className="logout-text-container">
                  <span className="logout-text">Log</span>
                  <span className="logout-text">out</span>
                </div>
              </div>
            )}
          </div>
          <a
            href="https://github.com/Shafosphere"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="github-sidebar">
              <div className="bar">
                <div className="border"></div>
              </div>
              <FaGithub />
              <div className="bar">
                <div className="border"></div>
              </div>
            </div>
          </a>
        </div>
      </div>
      {popupMessage && (
        <Popup
          message={popupMessage}
          emotion={popupEmotion}
          onClose={() => setPopupMessage("")}
        />
      )}
    </>
  );
}
