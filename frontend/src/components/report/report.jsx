import React, { useState, useContext } from "react";
import { FaRegQuestionCircle } from "react-icons/fa";
import "./report.css";
import api from "../../utils/api";
import { PopupContext } from "../popup/popupcontext";

export default function ReportForm() {
  const [reportType, setReportType] = useState("other");
  const [word, setWord] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");

  // popup
  const { setPopup } = useContext(PopupContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await api.post(
        "/report/add",
        {
          reportType,
          word,
          description,
          language,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setPopup({
          message: "report recived",
          emotion: "positive",
        });
      }
    } catch (error) {
      setPopup({
        message: "An error occurred",
        emotion: "negative",
      });

      console.log(error);
    }
  }

  return (
    <>
      <form className="report-form" onSubmit={handleSubmit}>
        <div className="report-top">
          <div>
            <label htmlFor="reportType">Report Type:</label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="other">Other</option>
              <option value="word_issue">Word Issue</option>
            </select>
          </div>
          {reportType === "word_issue" && (
            <div>
              <label htmlFor="word">Word:</label>
              <input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
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
                <option value=""></option>
                <option value="pl">Polish</option>
                <option value="en">English</option>
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
            type="submit" // Dodano atrybut type="submit"
          >
            Submit Report
          </button>
        </div>
      </form>
    </>
  );
}
