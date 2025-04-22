import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import "./panel-main.css";
import Block from "./block";
import ConfirmWindow from "../../confirm/confirm";
import PinWindow from "../../pin/pin";
import MyButton from "../../button/button";
import VisitChart from "./chartvisits.jsx";
import UserChart from "./chartusers.jsx";

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
      <div className="grid-container">
        {/* Users Blocks (Divs 1-4) */}
        <div className="grid-item item1">
          <Block number={data.total_users} title={"registered users"} />
        </div>
        <div className="grid-item item2">
          <Block number={data.total_reports} title={"user reports"} />
        </div>
        <div className="grid-item item3">
          <Block
            number={data.users_logged_in_today}
            title={"logged in today"}
          />
        </div>
        <div className="grid-item item4">
          {/* Add another user-related block if needed */}
        </div>

        {/* Visits Blocks (Divs 5-8) */}
        <div className="grid-item item5">
          <Block
            number={data.today_flashcard_visitors}
            title={"flashcard visits"}
          />
        </div>
        <div className="grid-item item6">
          <Block
            number={data.today_vocabulary_b2_visitors}
            title={"vocabulary B2 visits"}
          />
        </div>
        <div className="grid-item item7">
          <Block
            number={data.today_vocabulary_c1_visitors}
            title={"vocabulary C1 visits"}
          />
        </div>
        <div className="grid-item item8">
          {/* Add another visits-related block if needed */}
        </div>

        {/* Language Blocks (Divs 9-12) */}
        <div className="grid-item item9">
          <Block number={data.total_languages} title={"languages"} />
        </div>
        <div className="grid-item item10">
          <Block number={data.total_words} title={"number of words"} />
        </div>
        <div className="grid-item item11">
          <Block number={data.total_b2_words} title={"words B2"} />
        </div>
        <div className="grid-item item12">
          <Block number={data.total_c1_words} title={"words C1"} />
        </div>

        {/* Charts (Divs 13-15) */}
        <div className="grid-item item13">
          <UserChart />
        </div>
        <div className="grid-item item14">
          <VisitChart />
        </div>
        <div className="grid-item item15">
          {/* <VisitChart /> */}
        </div>
      </div>

      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}

      {isPinVisible && <PinWindow onClose={handlePinClose} />}
    </>
  );
}
