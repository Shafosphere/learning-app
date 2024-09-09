import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./panel-data.css";

export default function DataPanel() {
  const [data, setData] = useState({});

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.get("/global-data");
        if (response.data) {
          setData(response.data);
        } else {
          console.error("Invalid response from server", response);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    }

    getData();
  }, []);

  return (
    <>
      <div className="data-container">
        <div>Lang: {data.liczba_jezykow}</div>
        <div>Users: {data.liczba_uzytkownikow}</div>
        <div>Words: {data.liczba_slowek}</div>
        <div>Reports: {data.liczba_raportow}</div>
      </div>
    </>
  );
}
