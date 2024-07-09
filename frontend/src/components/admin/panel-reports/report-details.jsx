import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import ConfirmWindow from "../../confirm/confirm";
import Popup from "../../popup/popup";

import "./panel-reports.css";

export default function ReportDetails({ reportID, reloadData }) {
  const [report, setReport] = useState(null); // Początkowy stan ustawiony na null

  // popup
  const [popupMessage, setPopupMessage] = useState("");
  const [popupEmotion, setPopupEmotion] = useState("");

  // confirm
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleConfirmClose = (result) => {
    if (result && confirmCallback) {
      confirmCallback();
    }
    setConfirmMessage("");
    setConfirmCallback(null);
  };

  function showConfirm(text, callback) {
    setConfirmMessage(text);
    setConfirmCallback(() => callback);
  }

  const handleInputChange = (index, field, value) => {
    const newTranslations = [...report.translations];
    newTranslations[index][field] = value;
    setReport({ ...report, translations: newTranslations });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await api.post("/detail-report", { id: reportID });
        if (response.data) {
          setReport(response.data);
        } else {
          console.error("Niepoprawna odpowiedź z serwera", response);
        }
      } catch (error) {
        console.log(error);
      }
    };
    if (reportID) {
      getData();
    }
  }, [reportID]);

  if (!report) {
    return <div>Loading...</div>;
  }

  const updateData = async () => {
    try {
      const response = await api.patch("/detail-update", { report: report });
      setPopupEmotion("positive");
      setPopupMessage(response.data);
    } catch (error) {
      setPopupEmotion("negative");
      setPopupMessage(error.response?.data || "An error occurred");
      console.error("Error updating data:", error);
    }
  };

  const deleteData = async () => {
    try {
      const response = await api.delete("/detail-delete", {
        data: { id: report.id },
      });
      setPopupEmotion("positive");
      setPopupMessage(response.data);
      reloadData();
    } catch (error) {
      setPopupEmotion("negative");
      setPopupMessage(error.response?.data || "An error occurred");
      console.error("Error deleting data:", error);
    }
  };

  return (
    <div className="report-details">
      <div className="report-header">
        <h2>Report ID: {report.id}</h2>
        <p>
          <span>{report.username}</span>{" "}
          <span>{new Date(report.created_at).toLocaleString()}</span>
        </p>
      </div>

      <div className="report-description">
        <h3>Description</h3>
        <textarea
          value={report.description}
          onChange={(e) =>
            setReport({ ...report, description: e.target.value })
          }
        />
      </div>

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

      <div className="buttons-reports">
        <button
          className="button"
          style={{ "--buttonColor": "var(--secondary)" }}
          onClick={() =>
            showConfirm("Do you really want to delete these report?", () =>
              deleteData()
            )
          }
        >
          delete report
        </button>
        {report.report_type === "word_issue" && report.translations && (
          <button
            className="button"
            style={{ "--buttonColor": "var(--highlight)" }}
            onClick={() =>
              showConfirm("Are you sure you want to update your data?", () =>
                updateData()
              )
            }
          >
            update changes
          </button>
        )}
      </div>
      {popupMessage && (
        <Popup
          message={popupMessage}
          emotion={popupEmotion}
          onClose={() => setPopupMessage("")}
        />
      )}
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </div>
  );
}
