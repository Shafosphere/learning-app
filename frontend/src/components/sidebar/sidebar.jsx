import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { IoMdSettings } from "react-icons/io";
import { MdAccountBox, MdAdminPanelSettings } from "react-icons/md";
import { useIntl } from "react-intl";
import api from "../../utils/api";
import ReportPopup from "../report/report-popup";
import { PopupContext } from "../popup/popupcontext";
import { SettingsContext } from "../../pages/settings/properties";
import "./sidebar.css";
import { IoBug } from "react-icons/io5";
import { IoLogoGithub } from "react-icons/io5";
import { MdLogout, MdLogin } from "react-icons/md";
import { FaBook } from "react-icons/fa";
import { FaScroll } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md";
import { FaRankingStar } from "react-icons/fa6";

export default function Sidebar() {
  const { isLoggedIn, setIsLoggedIn, setUser, themeMode, toggleTheme } =
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
        <div className="sidebar-title">
          <span className="sidebar-initial">M</span>
          <span className="sidebar-full">emolingo</span>
        </div>

        <div className="sidebar-content">
          <div>
            <Link className="link" to="/home">
              <span className="sidebar-initial link-icon">
                <FaBook />
              </span>
              <span className="sidebar-full">
                <div className="link-text">Ucz sie</div>
              </span>
            </Link>

            <Link className="link" to="/vocabulary">
              <span className="sidebar-initial link-icon">
                <FaScroll />
              </span>
              <span className="sidebar-full">
                <div className="link-text">vocabulary tests</div>
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

            <Link className="link" to="/account">
              <span className="sidebar-initial link-icon">
                <MdAccountBox />
              </span>
              <span className="sidebar-full">
                <div className="link-text">account</div>
              </span>
            </Link>

            <Link className="link" to="/ranking">
              <span className="sidebar-initial link-icon">
                <FaRankingStar />
              </span>
              <span className="sidebar-full">
                <div className="link-text">ranking</div>
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

          <div>
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

            <div className="link">
              <span className="sidebar-initial link-icon">
                <MdDarkMode />
              </span>
              <span className="sidebar-full">
                <div className="link-text">
                  <input
                    type="checkbox"
                    className="theme-checkbox"
                    checked={themeMode === "dark"}
                    onChange={() => toggleTheme()}
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
                  <div className="link-text">Login</div>
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
                  <div className="link-text">github</div>
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
