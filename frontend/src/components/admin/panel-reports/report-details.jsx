import React, { useEffect, useState, useContext } from "react";
import api from "../../../utils/api";
import ConfirmWindow from "../../confirm/confirm";
import { PopupContext } from "../../popup/popupcontext";
import MyButton from "../../button/button";

import "./panel-reports.css";

// Component to view and edit details of a user report
export default function ReportDetails({ reportID, reloadData }) {
  const [report, setReport] = useState(null); // Initial state set to null

  const { setPopup } = useContext(PopupContext);

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

  // Handle in-place translation edits
  const handleInputChange = (index, field, value) => {
    const newTranslations = [...report.translations];
    newTranslations[index][field] = value;
    setReport({ ...report, translations: newTranslations });
  };

  // Fetch report data when reportID changes
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await api.post("/report/details", { id: reportID });
        if (response.data) {
          setReport(response.data);
        } else {
          console.error("Invalid response from server", response);
        }
      } catch (error) {
        console.error("Error fetching report details:", error);
      }
    };
    if (reportID) {
      getData();
    }
  }, [reportID]);

  if (!report) {
    return <div>Loading...</div>;
  }

  // Send updated report data to server
  const updateData = async () => {
    try {
      const response = await api.patch("/report/update", { report });
      setPopup({
        message: response.data,
        emotion: "positive",
      });
    } catch (error) {
      setPopup({
        message: error.response?.data || "An error occurred",
        emotion: "negative",
      });
      console.error("Error updating report:", error);
    }
  };

  // Delete report on confirmation
  const deleteData = async () => {
    try {
      const response = await api.delete(`/report/delete/${report.id}`); // Pass ID in path
      setPopup({
        message: response.data.message,
        emotion: "positive",
      });
      reloadData();
    } catch (error) {
      setPopup({
        message: error.response?.data || "An error occurred",
        emotion: "negative",
      });
      console.error("Error deleting report:", error);
    }
  };

  return (
    <div className="report-details">
      {/* Header with Report ID and metadata */}
      <div className="report-header">
        <h2>Report ID: {report.id}</h2>
        <p>
          <span>{report.username}</span>{" "}
          <span>{new Date(report.created_at).toLocaleString()}</span>
        </p>
      </div>

      {/* Description section */}
      <div className="report-description">
        <h3>Description</h3>
        <textarea
          value={report.description}
          onChange={(e) =>
            setReport({ ...report, description: e.target.value })
          }
        />
      </div>

      {/* Translation edits for word_issue reports */}
      {report.report_type === "word_issue" && report.translations && (
        <>
          {report.translations.map((translation, index) => (
            <div key={translation.id} className="translation-item">
              <div>
                <h4>Word ({translation.language.toUpperCase()})</h4>
                <input
                  type="text"
                  value={translation.translation}
                  onChange={(e) =>
                    handleInputChange(index, "translation", e.target.value)
                  }
                />
              </div>
              <div>
                <h4>Description ({translation.language.toUpperCase()})</h4>
                <textarea
                  value={translation.description}
                  onChange={(e) =>
                    handleInputChange(index, "description", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </>
      )}

      {/* Action buttons */}
      <div className="buttons-reports">
        <MyButton
          message="Delete Report"
          color="red"
          onClick={() =>
            showConfirm("Do you really want to delete this report?", deleteData)
          }
        />
        {report.report_type === "word_issue" && report.translations && (
          <MyButton
            message="Update Changes"
            color="green"
            onClick={() =>
              showConfirm(
                "Are you sure you want to apply these changes?",
                updateData
              )
            }
          />
        )}
      </div>

      {/* Confirmation modal */}
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}
