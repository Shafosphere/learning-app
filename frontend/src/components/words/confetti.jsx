import React, { useState, useEffect } from 'react';
import './confetti.css';

function Confetti({ generateConfetti }) {
  const total = 20;

  const [confettiElements, setConfettiElements] = useState([]);

  useEffect(() => {
    let interval;
    if (generateConfetti) {
      // Generujemy konfetti co pewien interwał
      interval = setInterval(() => {
        const newConfetti = Array.from({ length: total }, (_, i) => {
          const p = i / total;
          const random = Math.random();
          const style = {
            '--i': i,
            '--p': p,
            '--random': random,
          };

          return <div className="confetti" style={style} key={Math.random()}></div>;
        });

        setConfettiElements((prev) => [...prev, ...newConfetti]);
      }, 300); // Generuj nowe konfetti co 300ms
    }

    return () => {
      clearInterval(interval);
    };
  }, [generateConfetti]);

  return <div className="container-confetti">{confettiElements}</div>;
}

export default Confetti;
