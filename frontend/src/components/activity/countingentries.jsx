import { useEffect } from "react";
import api from "../../utils/api";
function usePageVisit(pageName) {
  useEffect(() => {
    const now = Date.now();
    const lastVisitTime = localStorage.getItem(`lastVisit_${pageName}`);
    const oneHour = 60 * 60 * 1000;

    if (!lastVisitTime || now - lastVisitTime > oneHour) {
      api
        .post("/analytics/visit", { page_name: pageName })
        .then((response) => {
          if (response.data.success) {
            localStorage.setItem(`lastVisit_${pageName}`, now);
          }
        })
        .catch((error) => {
          console.error("Błąd podczas aktualizacji statystyk wizyt:", error);
        });
    }
  }, [pageName]);
}

export default usePageVisit;
