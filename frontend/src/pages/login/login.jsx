import { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import LoginForm from "../../components/login/loginForm";
import RegiForm from "../../components/login/regiForm";
import MyButton from "../../components/button/button";
import ResetForm from "../../components/login/resetForm";
import "./login.css";
import { useLocation } from "react-router-dom";

export default function Login() {
  const [display, setDisplay] = useState("login");
  const location = useLocation();

  // Funkcja pomocnicza do renderowania przycisków
  const renderButtons = (buttons) => (
    <div className="bot-logg">
      {buttons.map(({ id, defaultMessage, target }, index) => (
        <MyButton
          key={index}
          message={<FormattedMessage id={id} defaultMessage={defaultMessage} />}
          color="yellow"
          width="20"
          onClick={() => setDisplay(target)}
        />
      ))}
    </div>
  );

  useEffect(() => {
    if (location.state?.display) {
      setDisplay(location.state.display);
    }
  }, [location.state]);

  return (
    <div className="container-logging">
      <div className="window-logg">
        {display === "login" && (
          <>
            <div className="top-logg">
              <LoginForm />
            </div>
            {renderButtons([
              {
                id: "register",
                defaultMessage: "Register",
                target: "register",
              },
              { id: "reset", defaultMessage: "Reset", target: "reset" },
            ])}
          </>
        )}
        {display === "register" && (
          <>
            <div className="top-logg">
              <RegiForm setDisplay={setDisplay} />
            </div>
            {renderButtons([
              { id: "login", defaultMessage: "Log In", target: "login" },
              { id: "reset", defaultMessage: "Reset", target: "reset" },
            ])}
          </>
        )}
        {display === "reset" && (
          <>
            <div className="top-logg">
              <ResetForm />
            </div>
            {renderButtons([
              { id: "login", defaultMessage: "Log In", target: "login" },
              {
                id: "register",
                defaultMessage: "Register",
                target: "register",
              },
            ])}
          </>
        )}
      </div>
    </div>
  );
}
