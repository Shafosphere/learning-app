import React, { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { MdOutlineLock, MdOutlineLockOpen } from "react-icons/md";
import api from "../../utils/api";
import { SettingsContext } from "../../pages/settings/properties";

export default function LoginForm({ setPopupMessage, setPopupEmotion }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { setIsLoggedIn, setUser } = useContext(SettingsContext); // Uzyskaj funkcje z kontekstu
  // const navigate = useNavigate();
  const intl = useIntl();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await api.post("/login", {
        username,
        password,
      });
      if (response.data.success) {
        setPopupEmotion("positive");
        setPopupMessage(intl.formatMessage({
          id: "loginSuccessful",
          defaultMessage: "Login successful",
        }));
        setIsLoggedIn(true); // Ustaw stan logowania na true
        setUser({ username }); // Ustaw zalogowanego użytkownika
      }
    } catch (error) {
      if (error.response.status === 401) {
        setPopupEmotion("negative");
        setPopupMessage(intl.formatMessage({
          id: "invalidCredentials",
          defaultMessage: "Invalid username or password",
        }));
      } else if (error.response.status === 500) {
        setPopupEmotion("warning");
        setPopupMessage(intl.formatMessage({
          id: "serverError",
          defaultMessage: "Server error. Please try again later.",
        }));
      } else {
        setPopupEmotion("negative");
        setPopupMessage(
          intl.formatMessage({
            id: "unexpectedError",
            defaultMessage: "An unexpected error occurred",
          })
        );
      }
      setError(error.response.data.message);
    }
  }

  return (
    <div className="container-LoginForm">
      <form onSubmit={handleSubmit}>
        <div className="title-logg">
          <FormattedMessage id="loggingIn" defaultMessage="Logging in" />
        </div>
        <div className="container-input">
          <div className="custom_input">
            <input
              className="input-login"
              name="username"
              type="text"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder={intl.formatMessage({
                id: "username",
                defaultMessage: "Username",
              })}
              required
            />
          </div>
          <div
            className="custom_input"
            style={{ display: "flex", alignItems: "center" }}
          >
            <input
              className="input-login"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
              required
            />
            <button
              type="button"
              className="btn-pass"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <MdOutlineLockOpen size={35} />
              ) : (
                <MdOutlineLock size={35} />
              )}
            </button>
          </div>
          {error && <p className="login-error">{error}</p>}
        </div>
        <button
          style={{ "--buttonColor": "var(--highlight)", width: "100%" }}
          className="button"
          type="submit"
        >
          <FormattedMessage id="loginButton" defaultMessage="Log in" />
        </button>
      </form>
    </div>
  );
}
