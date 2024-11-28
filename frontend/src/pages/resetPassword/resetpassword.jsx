import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import { MdOutlineLock, MdOutlineLockOpen } from "react-icons/md";
import "./resetpassword.css";
import MyButton from "../../components/button/button";
import api from "../../utils/api";
import { PopupContext } from "../../components/popup/popupcontext";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const { token } = useParams();

  const { setPopup } = useContext(PopupContext);

  async function handleSubmit(e) {
    // Sprawdzenie zgodności haseł
    if (password !== confirmPassword) {
      setPopup({
        message: "Passwords do not match. Please try again.",
        emotion: "warning",
      });
      return;
    }

    try {
      // Wyślij żądanie POST do backendu
      const response = await api.post("/auth/reset-password", {
        token,
        password,
      });

      if (response.status === 200) {
        setPopup({
          message: "Password has been reset successfully!",
          emotion: "positive",
        });
      }
    } catch (error) {
      if (error.response) {
        setPopup({
          message: error.response.data.message || "An error occurred",
          emotion: "negative",
        });
      } else {
        setPopup({
          message: "An error occurred. Please try again later.,",
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
              placeholder={"New Password"}
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
              placeholder={"Confirm New Password"}
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
          message="reset password"
          color="green"
          onClick={() => handleSubmit()}
        />
      </div>
    </div>
  );
}
