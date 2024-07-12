import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { IoMdHome, IoMdSettings } from "react-icons/io";
import { MdAccountBox, MdAdminPanelSettings } from "react-icons/md";
import { useIntl } from "react-intl";
import api from "../../utils/api";
import Popup from "../popup/popup";
import ReportPopup from "../report/report-popup";
import { SettingsContext } from "../../pages/settings/properties";
import "./sidebar.css";
import { IoBug } from "react-icons/io5";
import { IoLogoGithub } from "react-icons/io5";
import { MdLogout } from "react-icons/md";

export default function Sidebar() {
  const { isLoggedIn, setIsLoggedIn, setUser } =
    useContext(SettingsContext);

  const [isAdmin, setIsAdmin] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");
  const [isFormVisible, setFormVisible] = useState(false);
  const intl = useIntl();

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
        <div className="sidebar-title">
          <span className="sidebar-initial">M</span>
          <span className="sidebar-full">emolingo</span>
        </div>
        <div className="sidebar-top">

          <Link className="link" to="/home">
            <span className="sidebar-initial link-icon">
              <IoMdHome />
            </span>
            <span className="sidebar-full">
              <div className="link-text">Ucz sie</div>
            </span>
          </Link>

          <Link className="link" to="/settings">
            <span className="sidebar-initial link-icon">
              <IoMdSettings />
            </span>
            <span className="sidebar-full">
              <div className="link-text">settings</div>
            </span>
          </Link>

          <Link className="link" to="/login">
            <span className="sidebar-initial link-icon">
              <MdAccountBox />
            </span>
            <span className="sidebar-full">
              <div className="link-text">account</div>
            </span>
          </Link>

          {isAdmin && isLoggedIn && (
            <Link className="link" to="/admin">
              <span className="sidebar-initial link-icon">
                <MdAdminPanelSettings />
              </span>
              <span className="sidebar-full">
                <div className="link-text">admin_panel</div>
              </span>
            </Link>
          )}
        </div>

        <div className="sidebar-bottom">
          {isLoggedIn && (
            <div onClick={() => setFormVisible(true)} className="link">
              <span className="sidebar-initial link-icon">
                <IoBug />
              </span>
              <span className="sidebar-full">
                <div className="link-text">report_a_bug</div>
              </span>
            </div>
          )}

          {isLoggedIn && (
            <div onClick={logout} className="link">
              <span className="sidebar-initial link-icon">
                <MdLogout />
              </span>
              <span className="sidebar-full">
                <div className="link-text">Logout</div>
              </span>
            </div>
          )}

          <a
            href="https://github.com/Shafosphere"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="link">
              <span className="sidebar-initial link-icon">
                <IoLogoGithub />
              </span>
              <span className="sidebar-full">
                <div className="link-text">github</div>
              </span>
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
      <ReportPopup
        isFormVisible={isFormVisible}
        onFormVisibleChange={handleFormVisibleChange}
      />
    </>
  );
}
