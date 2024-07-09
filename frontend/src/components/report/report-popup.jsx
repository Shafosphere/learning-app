import React from "react";
import "./report.css";
import ReportForm from "./report";
import { IoMdCloseCircle } from "react-icons/io";

export default function ReportPopup({ isFormVisible, onFormVisibleChange }) {
  const handleCloseForm = () => {
    onFormVisibleChange(false);
  };

  return (
    <>
      {isFormVisible && (
        <div className="overlay">
          <div className="form-container">
            <ReportForm />
            <button className="close-button" onClick={handleCloseForm}>
              <IoMdCloseCircle />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
