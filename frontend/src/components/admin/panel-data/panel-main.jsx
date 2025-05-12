import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import ConfirmWindow from "../../confirm/confirm";
import PinWindow from "../../pin/pin";
import MyButton from "../../button/button";
import Block from "./block";
import VisitChart from "./chartvisits.jsx";
import UserChart from "./chartusers.jsx";
import "./panel-main.css";

// Dashboard main panel showing statistics and charts, with patch regeneration protected by PIN
export default function MainPanel() {
  const [data, setData] = useState({});

  // Confirmation dialog state
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleConfirmClose = (result) => {
    if (result && confirmCallback) {
      confirmCallback();
    }
    setConfirmMessage("");
    setConfirmCallback(null);
  };

  function showConfirm(message, callback) {
    setConfirmMessage(message);
    setConfirmCallback(() => callback);
  }

  // PIN entry modal state
  const [isPinVisible, setIsPinVisible] = useState(false);
  const [pinCallback, setPinCallback] = useState(null);

  const handlePinClose = (pin) => {
    if (pinCallback) {
      pinCallback(pin);
    }
    setIsPinVisible(false);
    setPinCallback(null);
  };

  function showPin(callback) {
    setIsPinVisible(true);
    setPinCallback(() => callback);
  }

  // Fetch global admin data on mount
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
        console.error("Error fetching admin data:", error);
      }
    }
    getData();
  }, []);

  // Trigger patch regeneration with confirmation and PIN verification
  function handleGeneratePatches() {
    showConfirm("Do you want to generate new patch values?", () => {
      showPin(async (pin) => {
        if (pin === null) {
          // User cancelled PIN entry
          return;
        }
        try {
          const response = await api.post("/admin/generatepatch", { pin });
          if (response.data.success) {
            alert(response.data.message || "Patches generated successfully.");
          } else {
            alert(
              response.data.message || "There was an error generating patches."
            );
          }
        } catch (error) {
          console.error("Error during patch generation:", error);
          const msg =
            error.response?.data?.message ||
            "An error occurred while generating patches.";
          alert(msg);
        }
      });
    });
  }

  return (
    <>
      <div className="grid-container">
        {/* User statistics blocks */}
        <div className="grid-item item1">
          <Block number={data.total_users} title="Registered Users" />
        </div>
        <div className="grid-item item2">
          <Block number={data.total_reports} title="User Reports" />
        </div>
        <div className="grid-item item3">
          <Block number={data.users_logged_in_today} title="Logged In Today" />
        </div>
        <div className="grid-item item4">
          {/* Placeholder for additional user stat */}
        </div>

        {/* Visit statistics blocks */}
        <div className="grid-item item5">
          <Block
            number={data.today_flashcard_visitors}
            title="Flashcard Visits"
          />
        </div>
        <div className="grid-item item6">
          <Block
            number={data.today_vocabulary_b2_visitors}
            title="Vocabulary B2 Visits"
          />
        </div>
        <div className="grid-item item7">
          <Block
            number={data.today_vocabulary_c1_visitors}
            title="Vocabulary C1 Visits"
          />
        </div>
        <div className="grid-item item8">
          {/* Placeholder for additional visit stat */}
        </div>

        {/* Language and word counts blocks */}
        <div className="grid-item item9">
          <Block number={data.total_languages} title="Languages" />
        </div>
        <div className="grid-item item10">
          <Block number={data.total_words} title="Total Words" />
        </div>
        <div className="grid-item item11">
          <Block number={data.total_b2_words} title="B2 Words" />
        </div>
        <div className="grid-item item12">
          <Block number={data.total_c1_words} title="C1 Words" />
        </div>

        {/* Charts */}
        <div className="grid-item item13">
          <UserChart />
        </div>
        <div className="grid-item item14">
          <VisitChart />
        </div>
        <div className="grid-item item15">
          {/* Additional chart placeholder */}
        </div>
      </div>

      {/* Confirmation modal for actions */}
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}

      {/* PIN entry modal for secure actions */}
      {isPinVisible && <PinWindow onClose={handlePinClose} />}

      {/* Button to trigger patch regeneration */}
      <div className="generate-patch-button">
        <MyButton
          message="Generate Patches"
          color="blue"
          onClick={handleGeneratePatches}
        />
      </div>
    </>
  );
}
