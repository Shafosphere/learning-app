import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/login", {
        username,
        password,
      }, {
        withCredentials: true
      });
      if (response.data.success) {
        navigate("/home");
      }
    } catch (error) {
      setError(error.response.data.message || "An unexpected error occurred");
    }
  }
  return (
    <div className="container-LoginForm">
      <form onSubmit={handleSubmit}>
        <div className="title-logg">Logging in</div>
        <div className="container-input">
          <div className="custom_input">
            <input
              className="input"
              name="username"
              type="text"
              value={username}
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
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
              placeholder="password"
              required
            />
          </div>
          {error && <p className="login-error">{error}</p>}
        </div>
        <button className="button-login" type="submit">
          Log in
        </button>
      </form>
    </div>
  );
}
