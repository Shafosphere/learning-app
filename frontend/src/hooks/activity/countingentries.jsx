import { useEffect } from "react";
import api from "../../utils/api";

// Custom hook to record a page visit, limited to once per hour
export default function usePageVisit(pageName) {
  useEffect(() => {
    const now = Date.now();
    const lastVisitTime = localStorage.getItem(`lastVisit_${pageName}`);
    const oneHour = 60 * 60 * 1000;

    // Send a visit event if no record in the last hour
    if (!lastVisitTime || now - lastVisitTime > oneHour) {
      api
        .post("/analytics/visit", { page_name: pageName })
        .then((response) => {
          if (response.data.success) {
            localStorage.setItem(`lastVisit_${pageName}`, now);
          }
        })
        .catch((error) => {
          console.error("Error updating visit analytics:", error);
        });
    }
  }, [pageName]);
}
