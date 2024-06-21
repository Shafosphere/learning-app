import { useState } from "react";
import LoginForm from "../../components/login/loginForm";
import RegiForm from "../../components/login/regiForm";
import "./login.css";
export default function Login() {
  const [display, setDisplay] = useState("login");
  return (
    <div className="container-logging">
      <div className="window-logg">
        {display === "login" && (
          <>
            <div className="top-logg">
              <LoginForm
              />
            </div>
            <div className="bot-logg">
              <button
                onClick={() => setDisplay("register")}
                className="button-login"
                type="submit"
              >
                register
              </button>
              <button className="button-login" type="submit">
                reset
              </button>
            </div>
          </>
        )}
        {display === "register" && (
          <>
            <div className="top-logg">
              <RegiForm setDisplay={setDisplay} />
            </div>
            <div className="bot-logg">
              <button
                onClick={() => setDisplay("login")}
                className="button-login"
                type="submit"
              >
                log in
              </button>
              <button className="button-login" type="submit">
                reset
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
