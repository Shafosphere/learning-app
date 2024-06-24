import React, { useState } from "react";
import axios from "axios";
import { FormattedMessage, useIntl } from "react-intl";

export default function RegiForm({ setDisplay }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirm] = useState("");

  const intl = useIntl();

  async function handleSubmit(event) {
    event.preventDefault();
    if (!passwordsMatch()) {
      alert(
        intl.formatMessage({
          id: "passwordMismatch",
          defaultMessage: "Password does not match",
        })
      );
      return;
    }
    try {
      const response = await axios.post("http://localhost:8080/register", {
        username,
        email,
        password,
        confirmPass,
      });
      if (response.data.success) {
        setDisplay("login");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Registration error", error);
      alert(
        intl.formatMessage({
          id: "registrationError",
          defaultMessage: "An error occurred during registration",
        })
      );
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
              className="input"
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
              type="email"
              value={email}
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={intl.formatMessage({
                id: "email",
                defaultMessage: "Email",
              })}
              required
            />
          </div>
          <div className="custom_input">
            <input
              className="input"
              type="password"
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={intl.formatMessage({
                id: "password",
                defaultMessage: "Password",
              })}
              required
            />
          </div>
          <div className="custom_input">
            <input
              className="input"
              type="password"
              value={confirmPass}
              autoComplete="new-password"
              onChange={(e) => setConfirm(e.target.value)}
              placeholder={intl.formatMessage({
                id: "confirmPassword",
                defaultMessage: "Confirm the password",
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
          <FormattedMessage id="signUp" defaultMessage="Sign up" />
        </button>
      </form>
    </div>
  );
}
