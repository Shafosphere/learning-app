import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./panel-reports.css";
import ReportDetails from "./report-details";

export default function ReportsPanel() {
  const [reports, setReports] = useState([]);
  const [reportID, setReportID] = useState(null);
  const [reload, setReload] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "type",
    direction: "ascending",
  });

  useEffect(() => {
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const getData = async () => {
      try {
        const response = await api.post("/data-reports");
        console.log(response.data);

        const formattedReports = response.data.map((report) => ({
          ...report,
          time: formatDate(new Date(report.time)),
        }));

        setReports(formattedReports);
      } catch (error) {
        console.log(error);
      }
    };
    getData();
  }, [reload]);

  const sortedReports = React.useMemo(() => {
    let sortableReports = [...reports];
    if (sortConfig !== null) {
      sortableReports.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableReports;
  }, [reports, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  function reloadData() {
    setReload((prev) => !prev);
    setReportID(null);
  }

  return (
    <>
      <div className="reports-container">
        <div className="reports-table">
          <table>
            <thead>
              <tr>
                <th onClick={() => requestSort("type")}>TYPE</th>
                <th onClick={() => requestSort("desc")}>DESC</th>
                <th onClick={() => requestSort("time")}>TIME</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.map((report, index) => (
                <tr key={index} onClick={() => setReportID(report.id)}>
                  <td>{report.type}</td>
                  <td>{report.desc}</td>
                  <td>{report.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ReportDetails reportID={reportID} reloadData={reloadData} />
    </>
  );
}
