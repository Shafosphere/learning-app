import React, { useEffect, useRef } from "react";
import gsap from "gsap";

import styles from "./boxanimation.module.css"; // CSS Modules

// Import obrazków z folderu data
import image1 from "./data/1.png";
import image2 from "./data/2.png";
import leweoko from "./data/leweoko.svg";
import zrenicalewa from "./data/zrenicalewa.svg";
import praweoko from "./data/praweoko.svg";
import zrenicaprawa from "./data/zrenicaprawa.svg";
import smile from "./data/smile.svg";
import zdziwienie from "./data/zdziwienie.svg";
import cute from "./data/minicutebox.png"
const NewSkinBox = ({ activeBox, boxName }) => {
  const boxRef = useRef(null);
  const smileRef = useRef(null);

  useEffect(() => {
    if (activeBox !== boxName) return; // Jeśli box nie jest aktywny, nie wykonuj animacji
  
    const tl = gsap.timeline();
  
    tl.set(smileRef.current, { attr: { src: zdziwienie } });
    tl.to(boxRef.current, {
      y: -100,
      duration: 0.6,
      ease: "power4.out"
    })
      .to(
        boxRef.current,
        {
          y: 0,
          duration: 0.5,
          ease: "bounce.out"
        },
        "-=0.3"
      )
      .to(
        boxRef.current,
        {
          rotation: 7,
          duration: 0.05,
          ease: "power1.inOut"
        },
        0.482
      )
      .to(
        boxRef.current,
        {
          rotation: -5,
          duration: 0.05,
          ease: "power1.inOut"
        },
        0.664
      )
      .to(
        boxRef.current,
        {
          rotation: 3,
          duration: 0.05,
          ease: "power1.inOut"
        },
        0.755
      )
      .to(
        boxRef.current,
        {
          rotation: 0,
          duration: 0.07,
          ease: "power1.inOut"
        },
        0.8
      )
      .set(smileRef.current, { attr: { src: smile } });
  }, [activeBox, boxName]);
  

  return (
    <div
    className={`${styles.pudelko} ${activeBox === boxName ? "active" : "notactive"}`}
    ref={boxRef}
    >
      {/* <img src={cute} className={styles.orginal}/> */}
      <img src={image1} className={styles.gornepudelko} alt="Obraz 1" />
      <img src={image2} className={styles.dolnepudelko} alt="Obraz 2" />
      <div className={styles.face}>
        <div className={styles.lewe_oko}>
          <img src={leweoko} className={`${styles.iris_left}`} alt="Lewe Oko" />
          <img src={zrenicalewa} className={`${styles.pupil_left}`} alt="Zrenica Lewa" />
        </div>
        <div className={styles.prawe_oko}>
          <img src={praweoko} className={styles.iris_right} alt="Prawe Oko" />
          <img src={zrenicaprawa} className={`${styles.pupil_right}`} alt="Zrenica Prawa" />
        </div>
        <img src={smile} ref={smileRef} className={styles.smile} alt="Smile" />
      </div>
    </div>
  );
};

export default NewSkinBox;
