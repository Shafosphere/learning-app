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
  const { isLoggedIn, setIsLoggedIn, user, setUser } = useContext(SettingsContext);

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
        <div className="sidebar-title">
          <span className="sidebar-initial">M</span>
          <span className="sidebar-full">emolingo</span>
        </div>
        <div className="sidebar-top">
          {/* Add your sidebar content here */}
        </div>
        <div className="sidebar-bottom">
          {/* Add your sidebar content here */}
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
