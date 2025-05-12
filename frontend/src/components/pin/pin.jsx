import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./pin.css";
import PinInput from "./pinInput";

// Modal dialog for PIN entry
export default function PinWindow({ onClose }) {
  const dialogRef = useRef(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        // Fallback for browsers that do not support the <dialog> element
        console.error("Browser does not support the <dialog> element.");
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onClose(pin);
    dialogRef.current.close();
  };

  const handleCancel = () => {
    onClose(null);
    dialogRef.current.close();
  };

  return ReactDOM.createPortal(
    <dialog ref={dialogRef} className="pin-dialog">
      <p>Enter PIN</p>
      <PinInput
        length={4}
        onComplete={(pin) => {
          onClose(pin);
        }}
      />
      <button
        style={{ "--buttonColor": "var(--tertiary)" }}
        className="button"
        onClick={handleCancel}
      >
        Cancel
      </button>
    </dialog>,
    document.getElementById("portal-root")
  );
}
