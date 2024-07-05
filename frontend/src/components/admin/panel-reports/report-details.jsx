import React, { useState } from 'react';
import './panel-reports.css';

export default function ReportDetails({ reportID }) {
    const [report, setReport] = useState({
        id: 1,
        user_id: 2,
        username: "exampleUser",
        report_type: "word_issue",
        word_id: 3,
        description: "Incorrect translation",
        created_at: "2024-07-05T10:00:00.000Z",
        translations: [
            {
                id: 1,
                word_id: 3,
                language: "en",
                translation: "example",
                description: "example description"
            },
            {
                id: 2,
                word_id: 3,
                language: "pl",
                translation: "przykład",
                description: "opis przykładu"
            }
        ]
    });

    const handleInputChange = (index, field, value) => {
        const newTranslations = [...report.translations];
        newTranslations[index][field] = value;
        setReport({ ...report, translations: newTranslations });
    };

    return (
        <div className="ReportDetails">
            <div className="ReportHeader">
                <h2>Report ID: {report.id}</h2>
                <p>BY: {report.username}  {new Date(report.created_at).toLocaleString()}</p>
            </div>
            <div className="ReportDescription">
                <h3>Description</h3>
                <textarea
                    value={report.description}
                    onChange={(e) => setReport({ ...report, description: e.target.value })}
                />
            </div>
            {report.translations.map((translation, index) => (
                <div key={translation.id} className="TranslationItem">
                    <div>
                        <h4>Word ({translation.language.toUpperCase()})</h4>
                        <input
                            type="text"
                            value={translation.translation}
                            onChange={(e) => handleInputChange(index, 'translation', e.target.value)}
                        />
                    </div>
                    <div>
                        <h4>Description ({translation.language.toUpperCase()})</h4>
                        <textarea
                            value={translation.description}
                            onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                        />
                    </div>
                </div>
            ))}
            <button className='button' onClick={() => alert('Saved!')}>Save Changes</button>
        </div>
    );
}