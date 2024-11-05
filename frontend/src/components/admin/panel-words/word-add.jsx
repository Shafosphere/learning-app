import { useState, useContext, useRef } from "react";
import ConfirmWindow from "../../confirm/confirm";
import api from "../../../utils/api";
import { PopupContext } from "../../popup/popupcontext";
import MyButton from "../../button/button";

export default function AddWord() {
  const selectRef = useRef(null);
  const [level, setLevel] = useState("B2");

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
    level: level,
  });

  const handleInputChange = (index, field, value) => {
    const newTranslations = [...word.translations];
    newTranslations[index][field] = value;
    setWord({ ...word, translations: newTranslations });
  };

  const handleLevelChange = (e) => {
    const newLevel = e.target.value;
    setLevel(newLevel);
    setWord({ ...word, level: newLevel });
  };

  async function addWord() {
    console.log(word);
    try {
      const response = await api.post("/word/add", word);
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

  const handleContainerClick = () => {
    if (selectRef.current) {
      selectRef.current.focus();
      selectRef.current.click();
    }
  };

  return (
    <>
      <div className="word-details">
        <div className="translation-container">
          {word.translations.map((translation, index) => (
            <div key={index} className="translation-item-words">
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
              <div className="level-container" onClick={handleContainerClick}>
                <label htmlFor="level">Choose level</label>
                <select
                  id="level"
                  name="level"
                  ref={selectRef}
                  value={level}
                  onChange={handleLevelChange}
                >
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                </select>
              </div>

              <MyButton
                message="Confirm"
                color="green"
                onClick={() =>
                  showConfirm(
                    "Are you sure you want to update your data?",
                    () => addWord()
                  )
                }
              />
            </>
          )}
        </div>
      </div>

      {confirmMessage && (
        <ConfirmWindow message={confirmMessage} onClose={handleConfirmClose} />
      )}
    </>
  );
}
