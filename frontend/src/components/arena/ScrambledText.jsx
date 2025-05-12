import { useEffect, useState, useRef } from "react";

// Component that animates text from one string to another by scrambling characters
export default function ScrambledText({
  text,
  duration = 1500,
  interval = 30,
}) {
  const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const [displayText, setDisplayText] = useState(text);
  const previousTextRef = useRef(text);
  const animationRef = useRef(null);

  // When the `text` prop changes, start the scramble animation
  useEffect(() => {
    if (text !== previousTextRef.current) {
      scramble(previousTextRef.current, text);
      previousTextRef.current = text;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Clean up the interval when the component unmounts
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

    // Clear any existing animation interval
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    animationRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Calculate current string length by interpolating between lengths
      const currentLength = Math.round(
        fromLength + (toLength - fromLength) * progress
      );

      let result = "";
      for (let i = 0; i < currentLength; i++) {
        // If this position is ready to show the target character
        if (i < toLength && progress >= (i + 1) / toLength) {
          result += toText[i];
        } else {
          // Otherwise show a random character from CHARACTERS
          result +=
            i < toLength
              ? CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
              : "";
        }
      }

      // Once done, ensure the final text is exactly the target
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
