let popupHandler = null;

export const registerPopupHandler = (handler) => {
  popupHandler = handler;
};

export const showPopup = (params) => {
  if (popupHandler) {
    popupHandler(params);
  } else {
    console.warn("Popup handler not registered!");
  }
};