import { useState, useContext } from "react";
import ConfirmWindow from "../../confirm/confirm";
import api from "../../../utils/api";
import { PopupContext } from "../../popup/popupcontext";
export default function AddWord() {
  // popup
  const { setPopup } = useContext(PopupContext);

  // confirm
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState(null);

  const handleConfirmClose = (result) => {
    if (result && confirmCallback) {
      confirmCallback();
    }
    setConfirmMessage("");
    setConfirmCallback(null);
  };

  function showConfirm(text, callback) {
    setConfirmMessage(text);
    setConfirmCallback(() => callback);
  }
  ////

  const [word, setWord] = useState({
    translations: [
      {
        language: "en",
        translation: "",
        description: "",
      },
      {
        language: "pl",
        translation: "",
        description: "",
      },
    ],
  });

  const handleInputChange = (index, field, value) => {
    const newTranslations = [...word.translations];
    newTranslations[index][field] = value;
    setWord({ ...word, translations: newTranslations });
  };

  async function addWord() {
    console.log("works");
    console.log(word);
    try {
      const response = await api.post("/word/add", { word: word });

      setPopup({
        message: response.data,
        emotion: "positive",
      });
    } catch (error) {
      console.log(error);
      setPopup({
        message: error.response?.data || "An error occurred",
        emotion: "negative",
      });
    }
  }

  return (
    <>
      <div className="word-details">
        <div className="translation-container">
          {word.translations.map((translation, index) => (
            <div key={translation.id} className="translation-item-words">
              <div>
                <div className="translation-header">
                  <span className="input-header">Word </span>
                  <span>
                    <h4>{translation.language}</h4>
                  </span>
                </div>
                <input
                  type="text"
                  value={translation.translation}
                  onChange={(e) =>
                    handleInputChange(index, "translation", e.target.value)
                  }
                />
              </div>
              <div>
                <div className="translation-header">
                  <span className="input-header">description</span>
                </div>
                <textarea
                  value={translation.description}
                  onChange={(e) =>
                    handleInputChange(index, "description", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="buttons-reports">
          {word.translations && (
            <button
              className="button"
              style={{ "--buttonColor": "var(--highlight)" }}
              onClick={() =>
                showConfirm("Are you sure you want to update your data?", () =>
                  addWord()
                )
              }
            >
              confirm
            </button>
          )}
        </div>
      </div>
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </>
  );
}
