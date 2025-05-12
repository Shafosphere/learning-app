import { useContext } from "react";
import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../../components/popup/popupcontext";

export default function useSpellchecking() {
  const { diacritical, spellChecking } = useContext(SettingsContext);
  const { setPopup } = useContext(PopupContext);

  function normalizeText(text) {
    return text
      .replace(/ą/g, "a")
      .replace(/ć/g, "c")
      .replace(/ę/g, "e")
      .replace(/ł/g, "l")
      .replace(/ń/g, "n")
      .replace(/ó/g, "o")
      .replace(/ś/g, "s")
      .replace(/ź/g, "z")
      .replace(/ż/g, "z");
  }

  // Implementation of the Levenshtein algorithm
  function levenshtein(a, b) {
    const matrix = [];

    // If one of the words is empty, distance is the length of the other word
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // Initialize first row and column
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    // Fill the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1, // deletion
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  function checkSpelling(userForm, correctForm) {
    console.log("diacritical is: " + diacritical);
    const processedUserWord = diacritical ? userForm : normalizeText(userForm);
    const processedCorrectAnswer = diacritical
      ? correctForm
      : normalizeText(correctForm);

    if (userForm.length <= 0) {
      setPopup({
        message: "You didn't enter anything.",
        emotion: "warning",
      });
      return false;
    } else if (correctForm.length <= 0) {
      setPopup({
        message: "Failed to load the correct word.",
        emotion: "warning",
      });
      return false;
    }

    const userWord = processedUserWord.trim().toLowerCase();
    const correctWord = processedCorrectAnswer.trim().toLowerCase();

    if (spellChecking) {
      // Tolerant mode: accept a single error
      if (userWord === correctWord) {
        return true;
      }
      const differences = levenshtein(userWord, correctWord);
      return differences <= 1;
    } else {
      // Strict mode: require exact match
      return userWord === correctWord;
    }
  }

  return checkSpelling;
}
