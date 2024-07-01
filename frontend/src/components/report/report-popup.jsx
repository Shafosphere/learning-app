import React from 'react';
import "./report.css"; // importuj plik CSS
import { FaBug } from "react-icons/fa";
import Draggable from "react-draggable";

export default function ReportPopup() {
  return (
    <Draggable defaultPosition={{ x: 425, y: 339 }}>
      <div className="draggable">
        <FaBug />
      </div>
    </Draggable>
  );
}
