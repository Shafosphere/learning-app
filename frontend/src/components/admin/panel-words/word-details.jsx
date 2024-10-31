import api from "../../../utils/api";
import ConfirmWindow from "../../confirm/confirm";
import { useState, useContext } from "react";
import { PopupContext } from "../../popup/popupcontext";

export default function WordDetail({ word, setWord }) {
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

  const handleInputChange = (index, field, value) => {
    const newTranslations = [...word.translations];
    newTranslations[index][field] = value;
    setWord({ ...word, translations: newTranslations });
  };

  const updateData = async () => {
    try {
      const response = await api.patch("/word/update", { word: word });
      setPopup({
        message: response.data,
        emotion: "positive",
      });
    } catch (error) {
      setPopup({
        message: error.response?.data || "An error occurred",
        emotion: "negative",
      });
      console.error("Error updating data:", error);
    }
  };

  const deleteWord = async () => {
    console.log("test");

    try {
      const wordId = word.translations[0].word_id;

      const response = await api.delete(`/word/delete/${wordId}`);
      setPopup({
        message: response.data,
        emotion: "positive",
      });
    } catch (error) {
      setPopup({
        message: error.response?.data || "An error occurred",
        emotion: "negative",
      });
      console.error("Error deleting word:", error);
    }
  };

  return (
    <>
      {word.translations && (
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
                <>
                  <button
                    className="button"
                    style={{ "--buttonColor": "var(--secondary)" }}
                    onClick={() =>
                      showConfirm(
                        "Are you sure you want to delete that word?",
                        () => deleteWord()
                      )
                    }
                  >
                    delete word
                  </button>
                  <button
                    className="button"
                    style={{ "--buttonColor": "var(--highlight)" }}
                    onClick={() =>
                      showConfirm(
                        "Are you sure you want to update your word?",
                        () => updateData()
                      )
                    }
                  >
                    update changes
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </>
  );
}
