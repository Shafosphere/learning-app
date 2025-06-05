import React, { useEffect, useState } from "react";
import "./admin-sidebar.css";
import { MdReportProblem } from "react-icons/md";
import { FaDatabase, FaUsers } from "react-icons/fa";
import { FaCrown } from "react-icons/fa";
import { IoMdConstruct } from "react-icons/io";
import api from "../../../utils/api";
import ConfirmWindow from "../../confirm/confirm";
import PinWindow from "../../pin/pin";

export default function AdminSidebar({ setActivePanel }) {
  // Confirmation dialog state
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleConfirmClose = (result) => {
    if (result && confirmCallback) {
      confirmCallback();
    }
    setConfirmMessage("");
    setConfirmCallback(null);
  };

  function showConfirm(message, callback) {
    setConfirmMessage(message);
    setConfirmCallback(() => callback);
  }

  // PIN entry modal state
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [pinCallback, setPinCallback] = useState(null);

  const handlePinClose = (pin) => {
    if (pinCallback) {
      pinCallback(pin);
    }
    setIsPinVisible(false);
    setPinCallback(null);
  };

  function showPin(callback) {
    setIsPinVisible(true);
    setPinCallback(() => callback);
  }

  function handleGeneratePatches() {
    showConfirm(
      "Do you want to shuffle the words in the draw system? (reshuffle the words that the user gets in the games)",
      () => {
        showPin(async (pin) => {
          if (pin === null) {
            // User cancelled PIN entry
            return;
          }
          try {
            const response = await api.post("/admin/generatepatch", { pin });
            if (response.data.success) {
              alert(response.data.message || "Patches generated successfully.");
            } else {
              alert(
                response.data.message ||
                  "There was an error generating patches."
              );
            }
          } catch (error) {
            console.error("Error during patch generation:", error);
            const msg =
              error.response?.data?.message ||
              "An error occurred while generating patches.";
            alert(msg);
          }
        });
      }
    );
  }

  return (
    <>
      <div className="container-adminsidebar">
        <div onClick={() => setActivePanel("main")} className="plate first">
          <span className="plate-icon">
            <FaCrown />
          </span>
          <span className="plate-title">main</span>
        </div>

        <div onClick={() => setActivePanel("reports")} className="plate first">
          <span className="plate-icon">
            <MdReportProblem />
          </span>
          <span className="plate-title">reports</span>
        </div>

        <div onClick={() => setActivePanel("words")} className="plate first">
          <span className="plate-icon">
            <FaDatabase />
          </span>
          <span className="plate-title">Words</span>
        </div>
        <div onClick={() => setActivePanel("users")} className="plate first">
          <span className="plate-icon">
            <FaUsers />
          </span>
          <span className="plate-title">users</span>
        </div>

        <div onClick={handleGeneratePatches} className="plate first reshuffle">
          <span className="plate-icon">
            <IoMdConstruct />
          </span>
          <span className="plate-title">reshuffle</span>
        </div>
      </div>

      {/* Confirmation modal for actions */}
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}

      {/* PIN entry modal for secure actions */}
      {isPinVisible && <PinWindow onClose={handlePinClose} />}
    </>
  );
}
