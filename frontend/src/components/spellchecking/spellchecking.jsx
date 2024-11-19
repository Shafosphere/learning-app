import { useContext } from "react";
import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../popup/popupcontext";

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
  
    function checkSpelling(userForm, correctForm) {
      const processedUserWord = diacritical
        ? userForm
        : normalizeText(userForm);
      const processedCorrectAnswer = diacritical
        ? correctForm
        : normalizeText(correctForm);
  
      if (userForm.length <= 0) {
        setPopup({
          message: "Chyba nic nie wpisałeś?",
          emotion: "warning",
        });
        return false;
      } else if (correctForm.length <= 0) {
        setPopup({
          message: "Niepoprawnie załadowane słówko",
          emotion: "warning",
        });
        return false;
      }
  
      const userWord = processedUserWord.trim().toLowerCase();
      const correctWord = processedCorrectAnswer.toLowerCase();
  
      if (spellChecking) {
        //wymagamy dokładnego dopasowania
        return userWord === correctWord;
      } else {
        //tolerujemy jeden błąd
        if (userWord === correctWord) {
          return true;
        }
  
        function countDifferences(word1, word2) {
          const len1 = word1.length;
          const len2 = word2.length;
          const maxLength = Math.max(len1, len2);
          let differences = 0;
  
          for (let i = 0; i < maxLength; i++) {
            if (word1[i] !== word2[i]) {
              differences++;
              if (differences > 1) {
                // Jeśli różnic jest więcej niż 1, przerywamy pętlę
                break;
              }
            }
          }
  
          return differences;
        }
  
        const differences = countDifferences(userWord, correctWord);
  
        return differences <= 1;
      }
    }
  
    return checkSpelling;
  }
  

//dodac: jezeli spellchecking off = telorowanie 1 błedu (litery)