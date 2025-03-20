import React, { createContext, useState, useEffect} from "react";
import NewPopup from "./newpopup";
import { registerPopupHandler } from "../../utils/popupManager";

export const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
  const [popup, setPopup] = useState(null);

  // Rejestrujemy funkcję setPopup w managerze
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

//instalacja -->

// useContext
// import { PopupContext } from "../popup/popupcontext";
// const { setPopup } = useContext(PopupContext);

// setPopup({
//     message: error.response?.data || "An error occurred",
//     emotion: "negative",
//   });

// setPopup({
//     message: response.data,
//     emotion: "positive",
//   });
