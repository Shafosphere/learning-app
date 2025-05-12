import React, { useState, useEffect } from "react";
import "./confetti.css";

// Confetti component that generates animated confetti elements when triggered
export default function Confetti({ generateConfetti }) {
  const total = 20;
  const [confettiElements, setConfettiElements] = useState([]);

  useEffect(() => {
    let interval;
    if (generateConfetti) {
      // Generate confetti at regular intervals
      interval = setInterval(() => {
        const newConfetti = Array.from({ length: total }, (_, i) => {
          const p = i / total;
          const random = Math.random();
          const style = {
            "--i": i,
            "--p": p,
            "--random": random,
          };

          return (
            <div className="confetti" style={style} key={Math.random()}></div>
          );
        });

        setConfettiElements((prev) => [...prev, ...newConfetti]);
      }, 300); // Generate new confetti every 300ms
    }

    return () => {
      clearInterval(interval);
    };
  }, [generateConfetti]);

  return <div className="container-confetti">{confettiElements}</div>;
}
