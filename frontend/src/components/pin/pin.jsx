import React, { useRef, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./pin.css";
import PinInput from "./pinInput";

export default function PinWindow({ onClose }) {
  const dialogRef = useRef(null);
  const [pin, setPin] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        // Fallback dla przeglądarek nie wspierających <dialog>
        console.error("Przeglądarka nie wspiera elementu <dialog>.");
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
      <p>Podaj PIN</p>
      <PinInput
        length={4}
        onComplete={(pin) => {
          onClose(pin);
        }}
      />
      <button
        style={{ "--buttonColor": "var(--tertiary)"}}
        className="button"
        onClick={() => onClose(null)}
      >
        Anuluj
      </button>
    </dialog>,
    document.getElementById("portal-root")
  );
}
