import api from "../../utils/api";

export default function usePatch({
  lvl,
  patchNumberB2,
  patchNumberC1,
  totalB2Patches,
  totalC1Patches,
  setPopup,
  setBoxes,
  setAutoSave,
  setB2Patch,
  setC1Patch,
  activeBox,
  selectRandomWord,
}) {
  async function getNextPatch() {
    try {
      let levelToFetch = lvl;

      let patchNumber = levelToFetch === "B2" ? patchNumberB2 : patchNumberC1;
      let totalPatches =
        levelToFetch === "B2" ? totalB2Patches : totalC1Patches;

      if (patchNumber > totalPatches) {
        setPopup({
          message: "Pobrales wszystkie słowa z tego poziomu!",
          emotion: "positive",
        });
        return;
      }

      const response = await requestPatch(levelToFetch, patchNumber);

      if (response && response.data && response.data.data) {
        const newWords = response.data.data;

        setBoxes((prevBoxes) => ({
          ...prevBoxes,
          boxOne: [...prevBoxes.boxOne, ...newWords],
        }));

        setAutoSave(true);

        // Aktualizuj numery patchy i typ następnego patcha
        if (levelToFetch === "B2") {
          setB2Patch(patchNumber + 1);
          localStorage.setItem("currentB2Patch-voca", patchNumber + 1);
        } else {
          setC1Patch(patchNumber + 1);
          localStorage.setItem("currentC1Patch-voca", patchNumber + 1);
        }
        if (activeBox === "boxOne") {
          selectRandomWord("boxOne");
        }
      }
    } catch (error) {
      console.error("Error fetching next patch:", error);
    }
  }

  async function requestPatch(level, patchNumber) {
    try {
      const response = await api.post("/word/patch-data", {
        level: level,
        patchNumber: patchNumber,
      });
      return response;
    } catch (error) {
      console.error(`Error fetching ${level} patch ${patchNumber}:`, error);
      throw error;
    }
  }

  return { getNextPatch };
}
