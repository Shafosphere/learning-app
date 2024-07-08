import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import "./panel-reports.css";

export default function ReportDetails({ reportID }) {
  const [report, setReport] = useState(null); // Początkowy stan ustawiony na null

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
          onClick={() => alert("Deleted!")}
        >
          delete report
        </button>
        <button
          className="button"
          style={{ "--buttonColor": "var(--highlight)" }}
          onClick={() => alert("Saved!")}
        >
          update changes
        </button>
      </div>
    </div>
  );
}
