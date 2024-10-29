import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./panel-main.css";
import ConfirmWindow from "../../confirm/confirm";
import PinWindow from "../../pin/pin";

export default function MainPanel() {
  const [data, setData] = useState({});

  // confirm
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleConfirmClose = (result) => {
    if (result && confirmCallback) {
      confirmCallback();
    }
    setConfirmMessage("");
    setConfirmCallback(null);
  };

  function showConfirm(text, callback) {
    setConfirmMessage(text);
    setConfirmCallback(() => callback);
  }
  ///

  //Pin
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [pinCallback, setPinCallback] = useState(null);

  const handlePinClose = (pin) => {
    if (pinCallback) {
      pinCallback(pin);
    }
    setIsPinVisible(false);
    setPinCallback(null);
  };

  const showPin = (callback) => {
    setIsPinVisible(true);
    setPinCallback(() => callback);
  };
  ///

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

  function handleGeneratePatches() {
    showConfirm("Czy chcesz wygenerować nowe wartości w Patch?", () => {
      showPin(async (pin) => {
        if (pin === null) {
          // Użytkownik anulował
          return;
        }
        try {
          // Wysyłamy żądanie do /admin/generatepatch z PIN-em w treści
          const response = await api.post("/admin/generatepatch", { pin });
          if (response.data.success) {
            alert(response.data.message || "Patche zostały wygenerowane pomyślnie.");
          } else {
            alert(response.data.message || "Wystąpił problem podczas generowania patchy.");
          }
        } catch (error) {
          console.error("Błąd:", error);
          // Obsługa błędów z odpowiedzi backendu
          if (error.response && error.response.data && error.response.data.message) {
            alert(error.response.data.message);
          } else {
            alert("Wystąpił błąd podczas generowania patchy.");
          }
        }
      });
    });
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

      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}

      {isPinVisible && <PinWindow onClose={handlePinClose} />}

    </>
  );
}
