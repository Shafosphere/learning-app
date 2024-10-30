import { useContext, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { SettingsContext } from "../../pages/settings/properties";
import styles from "./popup.module.css";

import correctSound from "../../data/pop.wav";
import wrongSound from "../../data/pop_even_sadder.wav";
import errorSound from "../../data/error.wav";

export default function NewPopup({
  message,
  emotion = "default",
  duration = 3000,
  onClose,
}) {
  const [isVisible, setIsVisible] = useState(true);

  const dingSoundRef = useMemo(() => new Audio(correctSound), []);
  const dingSadSoundRef = useMemo(() => new Audio(wrongSound), []);
  const errorSoundRef = useMemo(() => new Audio(errorSound), []);
  const { isSoundEnabled } = useContext(SettingsContext);

  useEffect(() => {
    // Dźwięk
    if (isSoundEnabled === "true") {
      let audio;
      switch (emotion) {
        case "positive":
          audio = dingSoundRef;
          audio.volume = 0.4;
          break;
        case "negative":
          audio = dingSadSoundRef;
          audio.volume = 0.4;
          break;
        case "warning":
          audio = errorSoundRef;
          audio.volume = 0.2;
          break;
        default:
          audio = dingSoundRef;
          audio.volume = 0.2;
      }
      audio
        ?.play()
        .catch((error) => console.error("Error playing sound:", error));
    }

    const hideTimer = setTimeout(() => setIsVisible(false), duration);
    const closeTimer = setTimeout(onClose, duration + 250);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(closeTimer);
    };
  }, [emotion, duration, isSoundEnabled, onClose]);

  const backgroundColor = {
    positive: "var(--highlight)",
    negative: "var(--secondary)",
    warning: "var(--tertiary)",
    default: "#333",
  }[emotion];

  const popupClass = `${styles.popup} ${isVisible ? styles.show : styles.hide}`;

  return ReactDOM.createPortal(
    <div
      role="alert"
      aria-live="assertive"
      className={popupClass}
      style={{ backgroundColor }}
    >
      {message}
    </div>,
    document.getElementById("portal-root")
  );
}
