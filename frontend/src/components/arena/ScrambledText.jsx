import { useEffect, useState, useRef } from "react";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function ScrambledText({
  text,
  duration = 1500,
  interval = 30,
}) {
  const [displayText, setDisplayText] = useState(text);
  const previousTextRef = useRef(text);
  const animationRef = useRef(null);

  // Efekt reagujący na zmianę tekstu (bez cleanup)
  useEffect(() => {
    if (text !== previousTextRef.current) {
      scramble(previousTextRef.current, text);
      previousTextRef.current = text;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Cleanup przy odmontowaniu komponentu
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  function scramble(fromText, toText) {
    const fromLength = fromText.length;
    const toLength = toText.length;
    const startTime = Date.now();

    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    animationRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolacja długości tekstu:
      const currentLength = Math.round(
        fromLength + (toLength - fromLength) * progress
      );

      let result = "";
      for (let i = 0; i < currentLength; i++) {
        if (i < toLength && progress >= (i + 1) / toLength) {
          result += toText[i];
        } else {
          // Ponieważ Math.random jest mockowane do 0, zawsze wybierzemy pierwszy znak, czyli 'A'
          result +=
            i < toLength
              ? CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
              : "";
        }
      }

      // Na końcu wymuś dokładną wartość
      if (progress === 1) {
        result = toText;
        clearInterval(animationRef.current);
        animationRef.current = null;
      }

      setDisplayText(result);
    }, interval);
  }

  return <span data-testid="scrambled-text">{displayText}</span>;
}
