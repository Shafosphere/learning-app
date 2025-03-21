import React, { useState, useContext, useEffect } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { MdOutlineLock, MdOutlineLockOpen } from "react-icons/md";
import { PopupContext } from "../popup/popupcontext";
import api from "../../utils/api";

export default function RegiForm({ setDisplay }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");``
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [requirements, setRequirements] = useState(null);

  const { setPopup } = useContext(PopupContext);

  const intl = useIntl();

  useEffect(() => {
    async function getRequirements() {
      try {
        const response = await api.get("/auth/requirements");
        if (response.data?.validationRules) {
          setRequirements(response.data.validationRules);
        }
      } catch (error) {
        console.log(error);
      }
    }
    getRequirements();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!passwordsMatch()) {
      setPopup({
        message: intl.formatMessage({
          id: "passwordMismatch",
          defaultMessage: "Password does not match",
        }),
        emotion: "negative",
      });
      return;
    }
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
      });
      if (response.data.success) {
        setPopup({
          message: intl.formatMessage({
            id: "registrationSuccessful",
            defaultMessage: "Registration successful",
          }),
          emotion: "positive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
    }
  }

  function passwordsMatch() {
    return password === confirmPass;
  }

  return (
    <div className="container-LoginForm">
      <form onSubmit={handleSubmit}>
        <div className="title-logg">
          <FormattedMessage
            id="createAccount"
            defaultMessage="Create an account"
          />
        </div>
        <div className="container-input">
          <div className="custom_input">
            <input
              className="input-login"
              type="text"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder={
                requirements
                  ? intl.formatMessage(
                      { id: "usernamePlaceholder" },
                      {
                        min: requirements.USERNAME.MIN_LENGTH,
                        max: requirements.USERNAME.MAX_LENGTH,
                      }
                    )
                  : intl.formatMessage({
                      id: "username",
                      defaultMessage: "Username",
                    })
              }
              required
            />
          </div>
          <div className="custom_input">
            <input
              className="input-login"
              type="email"
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={intl.formatMessage({
                id: "email",
                defaultMessage: "Email",
              })}
              required
            />
          </div>
          <div className="custom_input" style={{ position: "relative" }}>
            <input
              className="input-login"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                requirements
                  ? intl.formatMessage(
                      { id: "passwordPlaceholder" },
                      {
                        min: requirements.PASSWORD.MIN_LENGTH,
                        max: requirements.PASSWORD.MAX_LENGTH,
                      }
                    )
                  : intl.formatMessage({
                      id: "password",
                      defaultMessage: "Password",
                    })
              }
              required
            />
            <button
              type="button"
              className="btn-pass"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <MdOutlineLockOpen className="icon-lock" />
              ) : (
                <MdOutlineLock className="icon-lock" />
              )}
            </button>
          </div>
          <div className="custom_input" style={{ position: "relative" }}>
            <input
              className="input-login"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPass}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={intl.formatMessage({
                id: "confirmPassword",
                defaultMessage: "Confirm the password",
              })}
              required
            />
            <button
              type="button"
              className="btn-pass"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <MdOutlineLockOpen className="icon-lock" />
              ) : (
                <MdOutlineLock className="icon-lock" />
              )}
            </button>
          </div>
        </div>
        <button
          style={{ "--buttonColor": "var(--highlight)", width: "100%" }}
          className="button"
          type="submit"
        >
          <FormattedMessage id="signUp" defaultMessage="Sign up" />
        </button>
      </form>
    </div>
  );
}
