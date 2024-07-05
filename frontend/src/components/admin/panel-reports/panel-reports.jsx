import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./panel-reports.css";
import ReportDetails from "./report-details";
export default function ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [reportID, setReportID] = useState(null);

  useEffect(() => {

    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Miesiące są indeksowane od 0
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const getData = async () => {
      try {
        const response = await api.post("/data-reports");
        console.log(response.data); // Dodatkowy log, aby zobaczyć odpowiedź serwera

        const formattedReports = response.data.map(report => ({
          ...report,
          time: formatDate(new Date(report.time))
        }));

        setReports(formattedReports); // Aktualizacja stanu `reports` danymi z bazy danych
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, []);


  return (
    <>
      <div className="container-reports">
        <div className="table-reports">
          <table>
            <thead>
              <tr>
                <th>TYPE</th>
                <th>DESC</th>
                <th>TIME</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr key={index} onClick={()=>(setReportID(report.id))}>
                  <td>{report.type}</td>
                  <td>{report.desc}</td>
                  <td>{report.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ReportDetails reportID={reportID}/>
    </>
  );
}
