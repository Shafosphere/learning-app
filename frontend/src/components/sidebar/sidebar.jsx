import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { IoMdHome, IoMdSettings } from "react-icons/io";
import { MdAccountBox, MdLogin, MdAdminPanelSettings } from "react-icons/md";
import { FaBug, FaGithub } from "react-icons/fa";
import { useIntl } from "react-intl";
import api from "../../utils/api";
import Popup from "../popup/popup";
import ReportPopup from "../report/report-popup";
import { SettingsContext } from "../../pages/settings/properties";
import "./sidebar.css";

export default function Sidebar() {
  const { isLoggedIn, setIsLoggedIn, user, setUser } =
    useContext(SettingsContext);

  const [isAdmin, setIsAdmin] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");
  const intl = useIntl();

  const [isFormVisible, setFormVisible] = useState(false);

  const handleFormVisibleChange = (visible) => {
    setFormVisible(visible);
  };

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
        <SmallSidebar
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          handleDivClick={handleDivClick}
        />
        <BigSidebar
          isLoggedIn={isLoggedIn}
          setFormVisible={setFormVisible}
          logout={logout}
          user={user}
          isAdmin={isAdmin}
          handleDivClick={handleDivClick}
        />
      </div>
      {popupMessage && (
        <Popup
          message={popupMessage}
          emotion={popupEmotion}
          onClose={() => setPopupMessage("")}
        />
      )}
      <ReportPopup
        isFormVisible={isFormVisible}
        onFormVisibleChange={handleFormVisibleChange}
      />
    </>
  );
}

function SmallSidebar({ isAdmin, isLoggedIn, handleDivClick }) {
  return (
    <div className="small-sidebar">
      {/* <div className="title-sidebar">
        <span>Memolingo</span>
      </div> */}
      <PanelIcon
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        handleDivClick={handleDivClick}
      />
    </div>
  );
}

function BigSidebar({
  isLoggedIn,
  setFormVisible,
  logout,
  user,
  isAdmin,
  handleDivClick,
}) {
  return (
    <div className="big-sidebar">
      {/* <div className="title-sidebar">
        <span>Memolingo</span>
      </div> */}
      <PanelIcon
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        handleDivClick={handleDivClick}
        setFormVisible={setFormVisible}
        logout={logout}
        user={user}
      />
    </div>
  );
}

function PanelIcon({
  isAdmin,
  isLoggedIn,
  handleDivClick,
  setFormVisible,
  logout,
  user,
}) {
  return (
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
      {isAdmin && isLoggedIn && (
        <div className="four" onClick={handleDivClick}>
          <Link to="/admin">
            <MdAdminPanelSettings />
          </Link>
        </div>
      )}
      <div className="five"></div>
      <div className="six">
        <div>
          {isLoggedIn && (
            <div className="bug" onClick={() => setFormVisible(true)}>
              <FaBug />
            </div>
          )}
        </div>
      </div>
      <div className="seven">
        <div className="btn-container">
          {isLoggedIn && (
            <div onClick={logout} className="logout-button">
              <MdLogin className="logout-icon" />
              <div className="logout-text-container">
                <span className="logout-text">Log</span>
                <span className="logout-text">out</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="eight">
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
  );
}
