import React, { useRef, useEffect, useContext } from 'react';
import styles from './popup.module.css'; // Import CSS module
import correctSound from "../../data/pop.wav";
import wrongSound from "../../data/pop_even_sadder.wav";
import errorSound from "../../data/error.wav";
import { SettingsContext } from "../../pages/settings/properties";

export default function Popup({ message, emotion, onClose }) {
    const popupRef = useRef(null);

    // sounds
    const dingSoundRef = useRef(new Audio(correctSound));
    const dingSadSoundRef = useRef(new Audio(wrongSound));
    const errorSoundRef = useRef(new Audio(errorSound));
    const { isSoundEnabled } = useContext(SettingsContext);

    useEffect(() => {
        const popupElement = popupRef.current;
        if (popupElement) {
            popupElement.classList.add(styles.show);
            if (isSoundEnabled === 'true') {
                switch (emotion) {
                    case 'positive':
                        dingSoundRef.current.volume = 0.4;
                        dingSoundRef.current.play();
                        break;
                    case 'negative':
                        dingSadSoundRef.current.volume = 0.4;
                        dingSadSoundRef.current.play();
                        break;
                    case 'warning':
                        errorSoundRef.current.volume = 0.2;
                        errorSoundRef.current.play();
                        break;
                    default:
                        dingSoundRef.current.volume = 0.2;
                        dingSoundRef.current.play();
                }
            }
        }

        const timer = setTimeout(() => {
            if (popupElement) {
                popupElement.classList.remove(styles.show);
                popupElement.classList.add(styles.hide);
                setTimeout(() => {
                    onClose();
                }, 250);
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose, isSoundEnabled]);

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
        <div ref={popupRef} className={styles.popup} style={{ backgroundColor }}>
            {message}
        </div>
    );
}
