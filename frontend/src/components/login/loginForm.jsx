import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { MdOutlineLock, MdOutlineLockOpen } from "react-icons/md";
import api from "../../utils/api";
import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../popup/popupcontext";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  // const [error, setError] = useState("");

  const { setPopup } = useContext(PopupContext);

  const { setIsLoggedIn, setUser } = useContext(SettingsContext); // Uzyskaj funkcje z kontekstu
  const intl = useIntl();

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmedUsername = username.trimEnd();
    const trimmedPassword = password.trimEnd();
    try {
      const response = await api.post("/auth/login", {
        username: trimmedUsername,
        password: trimmedPassword,
      });
      if (response.data.success) {
        setPopup({
          message: intl.formatMessage({
            id: "loginSuccessful",
            defaultMessage: "Login successful",
          }),
          emotion: "positive",
        });
        setIsLoggedIn(true);
        setUser({ username });
        const redirectTo = new URLSearchParams(location.search).get(
          "redirectTo"
        );
        navigate(redirectTo || "/about");
      }
    } catch (error) {
      console.log(error);
      return;
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
                <MdOutlineLockOpen className="icon-lock" />
              ) : (
                <MdOutlineLock className="icon-lock" />
              )}
            </button>
          </div>
          {/* {error && <p className="login-error">{error}</p>} */}
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
