import React, { useState } from 'react';
import "./report.css"; // importuj plik CSS
import { FaBug } from "react-icons/fa";
import Draggable from "react-draggable";
import ReportForm from './report';

export default function ReportPopup() {
  const [isFormVisible, setFormVisible] = useState(false);

  const handleIconClick = () => {
    setFormVisible(true);
  };

  const handleCloseForm = () => {
    setFormVisible(false);
  };

  return (
    <>
      <Draggable defaultPosition={{ x: 425, y: 339 }}>
        <div className="draggable" onClick={handleIconClick}>
          <FaBug />
        </div>
      </Draggable>
      {isFormVisible && (
        <div className="overlay">
          <div className="form-container">
            <ReportForm />
            <button className="close-button" onClick={handleCloseForm}>Close</button>
          </div>
        </div>
      )}
    </>
  );
}
