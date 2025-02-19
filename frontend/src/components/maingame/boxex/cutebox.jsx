import React, { useEffect, useRef } from "react";
import gsap from "gsap";

import styles from "./cutebox.module.css";

import bottomBox from "./data/bottomBox.png";
import topBox from "./data/topBox.png";
import leftEyeImg from "./data/leftEyeImg.svg";
import leftPupilImg from "./data/leftPupilImg.svg";
import rightEyeImg from "./data/rightEyeImg.svg";
import rightPupilImg from "./data/rightPupilImg.svg";
import smile from "./data/smile.svg";
import surprised from "./data/surprised.svg";
import happy from "./data/happy.svg";

import card1 from "./data/miniflashcard1.png";
import card2 from "./data/miniflashcard2.png";
import card3 from "./data/miniflashcard3.png";

const CuteBoxSkin = ({ activeBox, boxName, words }) => {
  const boxRef = useRef(null);
  const smileRef = useRef(null);
  const activeBoxRef = useRef(activeBox);

  useEffect(() => {
    activeBoxRef.current = activeBox;
  }, [activeBox]);

  useEffect(() => {
    if (activeBox !== boxName) return;

    const tl = gsap.timeline();

    tl.set(smileRef.current, { attr: { src: surprised } })
      .to(boxRef.current, {
        y: -100,
        duration: 0.6,
        ease: "power4.out",
      })
      .to(
        boxRef.current,
        {
          y: 0,
          duration: 0.5,
          ease: "bounce.out",
        },
        "-=0.3"
      )
      .to(
        boxRef.current,
        {
          rotation: 7,
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.482
      )
      .to(
        boxRef.current,
        {
          rotation: -5,
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.664
      )
      .to(
        boxRef.current,
        {
          rotation: 3,
          duration: 0.05,
          ease: "power1.inOut",
        },
        0.755
      )
      .to(
        boxRef.current,
        {
          rotation: 0,
          duration: 0.07,
          ease: "power1.inOut",
        },
        0.8
      )
      .call(() => {
        if (activeBoxRef.current === boxName) {
          gsap.set(smileRef.current, { attr: { src: happy } });
        } else {
          gsap.set(smileRef.current, { attr: { src: smile } });
        }
      });

    const q = gsap.utils.selector(boxRef.current);
    const cards = q(`.${styles.card}`);

    tl.to(
      cards,
      {
        y: -15,
        duration: 0.2,
        ease: "power4.out",
      },
      0
    )

      .to(cards, {
        duration: 0.1,
        ease: "none",
      })

      .to(cards, {
        y: 0,
        duration: 0.5,
        ease: "bounce.out",
        stagger: 0.1,
      });
  }, [activeBox, boxName]);

  useEffect(() => {
    if (activeBox !== boxName && smileRef.current) {
      gsap.set(smileRef.current, { attr: { src: smile } });
    }
  }, [activeBox, boxName]);

  return (
    <div
      className={`${styles.cutebox} ${
        activeBox === boxName ? "active" : "notactive"
      }`}
      ref={boxRef}
    >
      <img src={topBox} className={styles.topBox} alt="topBox" />

      {words > 0 && (
        <img src={card1} className={styles.card} alt="flashcard1" />
      )}
      {words > 30 && (
        <img src={card2} className={styles.card} alt="flashcard2" />
      )}
      {words > 60 && (
        <img src={card3} className={styles.card} alt="flashcard3" />
      )}

      <img src={bottomBox} className={styles.bottomBox} alt="bottomBox" />
      <div className={styles.face}>
        <div className={styles.lefteye}>
          <img src={leftEyeImg} className={styles.iris_left} alt="iris_left" />
          <img
            src={leftPupilImg}
            className={styles.pupil_left}
            alt="leftPupilImg"
          />
        </div>
        <div className={styles.rightEye}>
          <img
            src={rightEyeImg}
            className={styles.iris_right}
            alt="iris_right"
          />
          <img
            src={rightPupilImg}
            className={styles.pupil_right}
            alt="pupil_right"
          />
        </div>
        <img src={smile} ref={smileRef} className={styles.smile} alt="Smile" />
      </div>
    </div>
  );
};

export default CuteBoxSkin;
