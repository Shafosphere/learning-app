import React, { useState } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import "./report.css";

export default function ReportForm() {
  const [reportType, setReportType] = useState("normal");
  const [wordId, setWordId] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Tutaj możesz dodać kod do wysłania formularza na serwer
    console.log({ reportType, wordId, description });
  };

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      <div className="report-top">
        <div>
          <label htmlFor="reportType">Report Type:</label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="normal">Other</option>
            <option value="word_issue">Word Issue</option>
          </select>
        </div>
        {reportType === "word_issue" && (
          <div>
            <label htmlFor="wordId">Word:</label>
            <input
              id="wordId"
              value={wordId}
              onChange={(e) => setWordId(e.target.value)}
            />
          </div>
        )}
        {reportType === "word_issue" && (
          <div className="language-field">
            <span className="question-form">
              <label htmlFor="language">Language:</label>
              <FaRegQuestionCircle
                className="question-icon"
                title="w jakim języku wpisałeś słowo wyżej?"
              />
            </span>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="Polish">Polish</option>
              <option value="English">English</option>
            </select>
          </div>
        )}
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="report-bottom">
        <button
          style={{ "--buttonColor": "var(--highlight)", width: "100%" }}
          className="button report-btn"
        >
          Submit Report
        </button>
      </div>
    </form>
  );
}
