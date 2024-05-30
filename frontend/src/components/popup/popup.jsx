import "./popup.css"
import React, { useRef , useEffect } from 'react';
export default function Popup({ message, emotion, onClose }){
    const dialogRef = useRef(null);

    useEffect(() => {
        const dialogElement = dialogRef.current;
        if (dialogElement) {
          dialogElement.show();
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