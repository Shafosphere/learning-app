import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { MdOutlineLock, MdOutlineLockOpen } from "react-icons/md";
import "./resetpassword.css";
import MyButton from "../../components/button/button";
import api from "../../utils/api";
import { PopupContext } from "../../components/popup/popupcontext";
import { useIntl } from "react-intl";
import { SettingsContext } from "../settings/properties";

export default function ResetPassword() {
  const intl = useIntl();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { token } = useParams();
  const { setPopup } = useContext(PopupContext);
  const { language } = useContext(SettingsContext);

  async function handleSubmit() {
    // Check if passwords match
    if (password !== confirmPassword) {
      setPopup({
        message: intl.formatMessage({
          id: "resetpassword.passwordMismatch",
          defaultMessage: "Passwords do not match. Please try again.",
        }),
        emotion: "warning",
      });
      return;
    }

    try {
      // Send POST request to the backend
      const response = await api.post("/auth/reset-password", {
        token,
        password,
        language,
      });

      if (response.status === 200) {
        setPopup({
          message: intl.formatMessage({
            id: "resetpassword.success",
            defaultMessage: "Password has been reset successfully!",
          }),
          emotion: "positive",
        });
      }
    } catch (error) {
      if (error.response) {
        setPopup({
          message:
            error.response.data.message ||
            intl.formatMessage({
              id: "resetpassword.error.generic",
              defaultMessage: "An error occurred",
            }),
          emotion: "negative",
        });
      } else {
        setPopup({
          message: intl.formatMessage({
            id: "resetpassword.error.tryLater",
            defaultMessage: "An error occurred. Please try again later.",
          }),
          emotion: "negative",
        });
      }
      console.error("Error resetting password:", error);
    }
  }

  return (
    <div className="container-logging">
      <div className="window-reset">
        <div>
          <div className="custom-input-reset" style={{ position: "relative" }}>
            <input
              className="input-login"
              type={showPassword ? "text" : "password"}
              value={password}
              autoComplete="new-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={intl.formatMessage({
                id: "resetpassword.placeholder.new",
                defaultMessage: "New Password",
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

          <div className="custom-input-reset" style={{ position: "relative" }}>
            <input
              className="input-login"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={intl.formatMessage({
                id: "resetpassword.placeholder.confirm",
                defaultMessage: "Confirm New Password",
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
        </div>

        <MyButton
          width="30"
          message={intl.formatMessage({
            id: "resetpassword.button",
            defaultMessage: "Reset Password",
          })}
          color="green"
          onClick={handleSubmit}
        />
      </div>
    </div>
  );
}
