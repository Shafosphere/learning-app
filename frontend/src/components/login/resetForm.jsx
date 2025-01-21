import React, { useState, useContext } from "react";
import api from "../../utils/api";
import { PopupContext } from "../popup/popupcontext";
import { useIntl, FormattedMessage } from "react-intl";

export default function ResetForm() {
  const [email, setEmail] = useState("");
  const { setPopup } = useContext(PopupContext);

  const intl = useIntl();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await api.post("/auth/send-reset-link", { email });
      setPopup({
        message: intl.formatMessage({
          id: "resetForm.emailSent",
          defaultMessage: "If the email exists, we will send a reset link.",
        }),
        emotion: "positive",
      });
    } catch (error) {
      console.error("Error sending email:", error);
      setPopup({
        message: intl.formatMessage({
          id: "resetForm.error",
          defaultMessage: "An error occurred while sending the reset link.",
        }),
        emotion: "negative",
      });
    }
  }

  return (
    <div className="container-LoginForm">
      <form onSubmit={handleSubmit}>
        <div className="title-logg">
          <FormattedMessage
            id="resetForm.title"
            defaultMessage="RESET PASSWORD"
          />
        </div>
        <div className="container-input">
          <div className="custom_input">
            <input
              className="input-login"
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={intl.formatMessage({
                id: "resetForm.emailPlaceholder",
                defaultMessage: "Enter your email",
              })}
              required
            />
          </div>
        </div>
        <button
          style={{ "--buttonColor": "var(--highlight)", width: "100%" }}
          className="button"
          type="submit"
        >
          <FormattedMessage
            id="resetForm.submitButton"
            defaultMessage="Reset Password"
          />
        </button>
      </form>
    </div>
  );
}
