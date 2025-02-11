import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { IoMdSettings } from "react-icons/io";
import {
  MdAccountBox,
  MdAdminPanelSettings,
  MdLogout,
  MdLogin,
} from "react-icons/md";
import { IoBug, IoLogoGithub } from "react-icons/io5";
import { FaBook, FaScroll } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";
import { FaRankingStar } from "react-icons/fa6";
import { useIntl, FormattedMessage } from "react-intl";

import api from "../../utils/api";
import ReportPopup from "../report/report-popup";
import { PopupContext } from "../popup/popupcontext";
import { SettingsContext } from "../../pages/settings/properties";
import "./sidebar.css";

import logo from "../../data/logo.png";

export default function Sidebar() {
  const { isLoggedIn, setIsLoggedIn, setUser, toggleTheme, logostatus} =
    useContext(SettingsContext);
  const { setPopup } = useContext(PopupContext);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isFormVisible, setFormVisible] = useState(false);

  const intl = useIntl();

  const handleFormVisibleChange = (visible) => {
    setFormVisible(visible);
  };


  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        const response = await api.get("/auth/admin");
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
      await api.post("/auth/logout");
      setIsLoggedIn(false);
      setUser(null);
      setPopup({
        message: intl.formatMessage({
          id: "logoutSuccessful",
          defaultMessage: "Logout successful",
        }),
        emotion: "positive",
      });
    } catch (error) {
      console.error("Logout error:", error);
      setPopup({
        message: intl.formatMessage({
          id: "logoutError",
          defaultMessage: "An error occurred during logout",
        }),
        emotion: "negative",
      });
    }
  };

  return (
    <>
      <div className="container-sidebar">
        {/* Brand name */}
        <div className="sidebar-title">
          <Link to="/about">
            {logostatus ? (
              <span>
                <img
                  alt="logo"
                  className="sidebar-logo"
                  src={logo}
                />
              </span>
            ) : (
              <span className="sidebar-initial">M</span>
            )}
          </Link>
          <span className="sidebar-full full-title">emolingo</span>
        </div>

        <div className="sidebar-content">
          <div>
            <Link className="link" to="/maingame">
              <span className="sidebar-initial link-icon">
                <FaBook />
              </span>
              <span className="sidebar-full">
                <div className="link-text">
                  <FormattedMessage id="sidebar.learn" defaultMessage="Learn" />
                </div>
              </span>
            </Link>

            <Link className="link" to="/vocabulary">
              <span className="sidebar-initial link-icon">
                <FaScroll />
              </span>
              <span className="sidebar-full">
                <div className="link-text">
                  <FormattedMessage
                    id="sidebar.vocabularyTests"
                    defaultMessage="Vocabulary Tests"
                  />
                </div>
              </span>
            </Link>

            <Link className="link" to="/settings">
              <span className="sidebar-initial link-icon">
                <IoMdSettings />
              </span>
              <span className="sidebar-full">
                <div className="link-text">
                  <FormattedMessage
                    id="sidebar.settings"
                    defaultMessage="Settings"
                  />
                </div>
              </span>
            </Link>

            <Link className="link" to="/account">
              <span className="sidebar-initial link-icon">
                <MdAccountBox />
              </span>
              <span className="sidebar-full">
                <div className="link-text">
                  <FormattedMessage
                    id="sidebar.account"
                    defaultMessage="Account"
                  />
                </div>
              </span>
            </Link>

            <Link className="link" to="/ranking">
              <span className="sidebar-initial link-icon">
                <FaRankingStar />
              </span>
              <span className="sidebar-full">
                <div className="link-text">
                  <FormattedMessage
                    id="sidebar.ranking"
                    defaultMessage="Ranking"
                  />
                </div>
              </span>
            </Link>

            {isAdmin && isLoggedIn && (
              <Link className="link" to="/admin">
                <span className="sidebar-initial link-icon">
                  <MdAdminPanelSettings />
                </span>
                <span className="sidebar-full">
                  <div className="link-text">
                    <FormattedMessage
                      id="sidebar.adminPanel"
                      defaultMessage="Admin Panel"
                    />
                  </div>
                </span>
              </Link>
            )}
          </div>

          <div>
            {isLoggedIn && (
              <div onClick={() => setFormVisible(true)} className="link">
                <span className="sidebar-initial link-icon">
                  <IoBug />
                </span>
                <span className="sidebar-full">
                  <div className="link-text">
                    <FormattedMessage
                      id="sidebar.reportBug"
                      defaultMessage="Report a bug"
                    />
                  </div>
                </span>
              </div>
            )}

            {isLoggedIn && (
              <div onClick={logout} className="link">
                <span className="sidebar-initial link-icon">
                  <MdLogout />
                </span>
                <span className="sidebar-full">
                  <div className="link-text">
                    <FormattedMessage
                      id="sidebar.logout"
                      defaultMessage="Logout"
                    />
                  </div>
                </span>
              </div>
            )}

            <div className="link" onClick={() => toggleTheme()}>
              <span className="sidebar-initial link-icon">
                <MdDarkMode />
              </span>
              <span className="sidebar-full">
                <div className="link-text">
                  <FormattedMessage
                    id="sidebar.darkMode"
                    defaultMessage="Dark Mode"
                  />
                </div>
              </span>
            </div>

            {!isLoggedIn && (
              <Link className="link" to="/login">
                <span className="sidebar-initial link-icon">
                  <MdLogin />
                </span>
                <span className="sidebar-full">
                  <div className="link-text">
                    <FormattedMessage
                      id="sidebar.login"
                      defaultMessage="Login"
                    />
                  </div>
                </span>
              </Link>
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
                  <div className="link-text">
                    <FormattedMessage
                      id="sidebar.github"
                      defaultMessage="GitHub"
                    />
                  </div>
                </span>
              </div>
            </a>
          </div>
        </div>
      </div>

      <ReportPopup
        isFormVisible={isFormVisible}
        onFormVisibleChange={handleFormVisibleChange}
      />
    </>
  );
}
