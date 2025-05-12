import React, { useState, useContext } from "react";
import "./report.css";
import api from "../../utils/api";
import { PopupContext } from "../popup/popupcontext";
import { useIntl, FormattedMessage } from "react-intl";

export default function ReportForm() {
  const [reportType, setReportType] = useState("other");
  const [word, setWord] = useState("");
  const [description, setDescription] = useState("");

  const { setPopup } = useContext(PopupContext);
  const intl = useIntl();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await api.post(
        "/report/add",
        {
          reportType,
          word,
          description,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data.success) {
        setPopup({
          message: intl.formatMessage({
            id: "reportForm.success",
            defaultMessage: "Report received",
          }),
          emotion: "positive",
        });
      }
    } catch (error) {
      setPopup({
        message: intl.formatMessage({
          id: "reportForm.error",
          defaultMessage: "An error occurred",
        }),
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
            <label htmlFor="reportType">
              <FormattedMessage
                id="reportForm.reportType"
                defaultMessage="Report Type:"
              />
            </label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="other">
                {intl.formatMessage({
                  id: "reportForm.typeOther",
                  defaultMessage: "Other",
                })}
              </option>
              <option value="word_issue">
                {intl.formatMessage({
                  id: "reportForm.typeWordIssue",
                  defaultMessage: "Word Issue",
                })}
              </option>
            </select>
          </div>
          {reportType === "word_issue" && (
            <div>
              <label htmlFor="word">
                <FormattedMessage id="reportForm.word" defaultMessage="Word:" />
              </label>
              <input
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
              />
            </div>
          )}
          <div className="description-report-containter">
            <label htmlFor="description">
              <FormattedMessage
                id="reportForm.description"
                defaultMessage="Description:"
              />
            </label>
            <textarea
              className="description-report"
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
            type="submit"
          >
            <FormattedMessage
              id="reportForm.submitButton"
              defaultMessage="Submit Report"
            />
          </button>
        </div>

      </form>
    </>
  );
}
