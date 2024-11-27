import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { FormattedMessage, useIntl } from "react-intl";
import api from "../../utils/api";
// import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../popup/popupcontext";

export default function ResetForm() {
  const [email, setEmail] = useState("");
  const { setPopup } = useContext(PopupContext);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await api.post("/auth/reset-password", {
        email,
      });
    } catch (error) {
      console.error("Error sending emial:", error);
    }
    setPopup({
      message: "If the email exists, we will send a reset link.",
      emotion: "positive",
    });
  }

  return (
    <div className="container-LoginForm">
      <form onSubmit={handleSubmit}>
        <div className="title-logg">RESET PASSWORD</div>
        <div className="container-input">
          <div className="custom_input">
            <input
              className="input-login"
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="enter your email"
              required
            />
          </div>
        </div>
        <button
          style={{ "--buttonColor": "var(--highlight)", width: "100%" }}
          className="button"
          type="submit"
        >
          reset password
        </button>
      </form>
    </div>
  );
}
