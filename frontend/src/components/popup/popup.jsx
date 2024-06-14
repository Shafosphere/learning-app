import "./popup.css"
import React, { useRef , useEffect, useContext  } from 'react';
import correctSound from "../../data/pop.wav";
import { SettingsContext } from "../../pages/settings/properties";

export default function Popup({ message, emotion, onClose }){
    const dialogRef = useRef(null);

    //sounds
    const dingSoundRef = useRef(new Audio(correctSound));
    const { isSoundEnabled } = useContext(SettingsContext);


    useEffect(() => {
        const dialogElement = dialogRef.current;
        if (dialogElement) {
          dialogElement.show();
            if (isSoundEnabled === 'true') {
                dingSoundRef.current.volume = 0.1;
                dingSoundRef.current.play();
            }
        }
  
        const timer = setTimeout(() => {
          if (dialogElement) {
            dialogElement.classList.add('closing');
            setTimeout(() => {
              dialogElement.close();
              onClose();
            }, 250);
          }
        }, 3000);
  
      return () => clearTimeout(timer);
    }, [onClose]);
  
    let backgroundColor;
    switch (emotion) {
      case 'positive':
        backgroundColor = 'var(--highlight)';
        break;
      case 'negative':
        backgroundColor = 'var(--secondary)';
        break;
      case 'warning':
        backgroundColor = 'var(--tertiary)';
        break;
      default:
        backgroundColor = '#333';
    }
  
    return (
      <dialog ref={dialogRef} className="popup" style={{ backgroundColor }}>
        {message}
      </dialog>
    );
}