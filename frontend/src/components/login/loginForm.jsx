import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FormattedMessage, useIntl } from "react-intl";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const intl = useIntl();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/login",
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );
      if (response.data.success) {
        navigate("/home");
      }
    } catch (error) {
      setError(
        error.response.data.message ||
          intl.formatMessage({
            id: "unexpectedError",
            defaultMessage: "An unexpected error occurred",
          })
      );
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
              className="input"
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
          <div className="custom_input">
            <input
              className="input"
              name="password"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
              required
            />
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
