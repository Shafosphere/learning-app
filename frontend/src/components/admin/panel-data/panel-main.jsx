import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./panel-main.css";
import Block from "./block";
import ConfirmWindow from "../../confirm/confirm";
import PinWindow from "../../pin/pin";
import MyButton from "../../button/button";
import VisitChart from "./chart";

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
            alert(
              response.data.message || "Patche zostały wygenerowane pomyślnie."
            );
          } else {
            alert(
              response.data.message ||
                "Wystąpił problem podczas generowania patchy."
            );
          }
        } catch (error) {
          console.error("Błąd:", error);
          // Obsługa błędów z odpowiedzi backendu
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
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
      <div className="data-container-adminpanel">
        <div className="section">
          <div className="section-title">users</div>
          <div className="section-adminpanel">
            <div className="blocks-container">
              <div>
                <Block number={data.total_users} title={"registered users"} />
                <Block number={data.total_reports} title={"user reports"} />
              </div>
              <div>
                <Block
                  number={data.users_logged_in_today}
                  title={"logged in today"}
                />
              </div>
            </div>
            <div className="chart-container">
              <VisitChart />
            </div>
          </div>
        </div>
        <div className="section">
          <div className="section-title">Visits</div>
          <div className="section-adminpanel">
            <div className="blocks-container">
              <div>
                <Block
                  number={data.today_flashcard_visitors}
                  title={"flashcard visits"}
                />
                <Block
                  number={data.today_vocabulary_b2_visitors}
                  title={"vocabulary B2 visits"}
                />
              </div>
              <div>
                <Block
                  number={data.today_vocabulary_c1_visitors}
                  title={"vocabulary C1 visits"}
                />
              </div>
            </div>
            <div className="chart-container">
              <VisitChart />
            </div>
          </div>
        </div>
        <div className="section">
          <div className="section-title">Language</div>
          <div className="section-adminpanel">
            <div className="blocks-container">
              <div>
                <Block number={data.total_languages} title={"languages"} />
                <Block number={data.total_words} title={"number of words"} />
              </div>
              <div>
                <Block number={data.total_b2_words} title={"words B2"} />
                <Block number={data.total_c1_words} title={"words C1"} />
              </div>
            </div>
            <div className="chart-container">
              <VisitChart />
            </div>
          </div>
        </div>
      </div>

      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}

      {isPinVisible && <PinWindow onClose={handlePinClose} />}
    </>
  );
}

{
  /* <MyButton
            message="re-draw patch system "
            color="red"
            onClick={() => handleGeneratePatches()}
          /> */
}
