import { useState } from "react";
import { FormattedMessage } from "react-intl";
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
              <LoginForm />
            </div>
            <div className="bot-logg">
              <button
                style={{ "--buttonColor": "var(--tertiary)", width: "50%" }}
                onClick={() => setDisplay("register")}
                className="button"
                type="submit"
              >
                <FormattedMessage id="register" defaultMessage="Register" />
              </button>
              <button
                style={{ "--buttonColor": "var(--tertiary)", width: "50%" }}
                className="button"
                type="submit"
              >
                <FormattedMessage id="reset" defaultMessage="Reset" />
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
                className="button"
                style={{ "--buttonColor": "var(--tertiary)", width: "50%" }}
                type="submit"
              >
                <FormattedMessage id="login" defaultMessage="Log In" />
              </button>
              <button
                style={{ "--buttonColor": "var(--tertiary)", width: "50%" }}
                className="button"
                type="submit"
              >
                <FormattedMessage id="reset" defaultMessage="Reset" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
