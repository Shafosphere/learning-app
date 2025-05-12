import React, { createContext, useState, useEffect } from "react";
import NewPopup from "./newpopup";
import { registerPopupHandler } from "../../utils/popupManager";

export const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState(null);

  // Register the setPopup function with the popup manager
  useEffect(() => {
    registerPopupHandler((params) => {
      setPopup(params);
    });
  }, []);

  return (
    <PopupContext.Provider value={{ setPopup }}>
      {children}
      {popup && (
        <NewPopup
          message={popup.message}
          emotion={popup.emotion}
          duration={popup.duration}
          onClose={() => setPopup(null)}
        />
      )}
    </PopupContext.Provider>
  );
};

/* Installation and usage examples:

// To use in a component:
// import { PopupContext } from "../popup/popupcontext";
// const { setPopup } = useContext(PopupContext);

// Trigger a negative popup (e.g., on error):
// setPopup({
//   message: error.response?.data || "An error occurred",
//   emotion: "negative",
// });

// Trigger a positive popup (e.g., on success):
// setPopup({
//   message: response.data,
//   emotion: "positive",
// });
*/
