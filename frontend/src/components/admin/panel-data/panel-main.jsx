import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./panel-main.css";

export default function MainPanel() {
  const [data, setData] = useState({});

  useEffect(() => {
    async function getData() {
      try {
        const response = await api.get("/admin/global-data");
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

  async function handleGeneratePatches() {
    console.log('start')
    try {
      const respone = await api.post("/admin/generatepatch");

      if (respone) {
        alert("Patche zostały wygenerowane pomyślnie.");
      } else {
        alert("Wystąpił problem podczas generowania patchy.");
      }
    } catch (error) {
      console.error("Błąd:", error);
    }
  }

  return (
    <>
      <div className="data-container">
        <div>Lang: {data.liczba_jezykow}</div>
        <div>Users: {data.liczba_uzytkownikow}</div>
        <div>Words: {data.liczba_slowek}</div>
        <div>Reports: {data.liczba_raportow}</div>

        <button
          className="button"
          style={{ "--buttonColor": "var(--secondary)" }}
          onClick={() => handleGeneratePatches()}
        >
          patch
        </button>
      </div>
    </>
  );
}
