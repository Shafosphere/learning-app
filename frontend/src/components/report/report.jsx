import React, { useState } from 'react';
import "./report.css";

export default function ReportForm() {
    const [reportType, setReportType] = useState('normal');
    const [wordId, setWordId] = useState('');
    const [description, setDescription] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Tutaj możesz dodać kod do wysłania formularza na serwer
        console.log({ reportType, wordId, description });
    };

    return (
        <form className="report-form" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="reportType">Report Type:</label>
                <select
                    id="reportType"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                >
                    <option value="normal">Normal</option>
                    <option value="word_issue">Word Issue</option>
                </select>
            </div>
            {reportType === 'word_issue' && (
                <div>
                    <label htmlFor="wordId">Word ID:</label>
                    <input
                        type="number"
                        id="wordId"
                        value={wordId}
                        onChange={(e) => setWordId(e.target.value)}
                    />
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
            <button type="submit">Submit Report</button>
        </form>
    );
}
