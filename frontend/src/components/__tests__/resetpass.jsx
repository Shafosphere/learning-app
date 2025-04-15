import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ResetPassword from "../../pages/resetPassword/resetpassword";
import { IntlProvider } from "react-intl";
import enMessages from "../../locales/en.json";
import { PopupContext } from "../../components/popup/popupcontext";
import { SettingsContext } from "../../pages/settings/properties";
import { useParams } from "react-router-dom";
import api from "../../utils/api";

// Mock react-router-dom
vi.mock("react-router-dom", async () => ({
  ...(await vi.importActual("react-router-dom")),
  useParams: vi.fn(),
}));

// Mock API
vi.mock("../../utils/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockSetPopup = vi.fn();
const mockSettings = {
  language: "en",
};

const Wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={enMessages}>
    <SettingsContext.Provider value={mockSettings}>
      <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
        {children}
      </PopupContext.Provider>
    </SettingsContext.Provider>
  </IntlProvider>
);

describe("ResetPassword Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useParams.mockImplementation(() => ({ token: "test-token" }));
  });

  it("renders correctly", () => {
    const { container } = render(<ResetPassword />, { wrapper: Wrapper });

    expect(screen.getByPlaceholderText("New Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm New Password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reset Password/i })
    ).toBeInTheDocument();

    // Użycie querySelectorAll do znalezienia przycisków zmiany widoczności hasła
    const toggleButtons = container.querySelectorAll("button.btn-pass");
    expect(toggleButtons).toHaveLength(2);
  });

  it("toggles password visibility", () => {
    const { container } = render(<ResetPassword />, { wrapper: Wrapper });

    const toggleButtons = container.querySelectorAll("button.btn-pass");
    const passwordInput = screen.getByPlaceholderText("New Password");

    // Początkowo typ inputa powinien być "password"
    expect(passwordInput).toHaveAttribute("type", "password");

    // Kliknięcie pierwszego przycisku powoduje zmianę typu na "text"
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Ponowne kliknięcie przywraca typ "password"
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute("type", "password");
  });

  it("updates password fields correctly", () => {
    render(<ResetPassword />, { wrapper: Wrapper });

    const passwordInput = screen.getByPlaceholderText("New Password");
    const confirmInput = screen.getByPlaceholderText("Confirm New Password");

    fireEvent.change(passwordInput, { target: { value: "newPass123" } });
    fireEvent.change(confirmInput, { target: { value: "newPass123" } });

    expect(passwordInput.value).toBe("newPass123");
    expect(confirmInput.value).toBe("newPass123");
  });

  it("shows error on password mismatch", async () => {
    render(<ResetPassword />, { wrapper: Wrapper });

    fireEvent.change(screen.getByPlaceholderText("New Password"), {
      target: { value: "pass1" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), {
      target: { value: "pass2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "Passwords do not match. Please try again.",
        emotion: "warning",
      });
    });
  });

  it("submits successfully with matching passwords", async () => {
    api.post.mockResolvedValueOnce({ status: 200 });

    render(<ResetPassword />, { wrapper: Wrapper });

    fireEvent.change(screen.getByPlaceholderText("New Password"), {
      target: { value: "validPass" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), {
      target: { value: "validPass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/reset-password", {
        token: "test-token",
        password: "validPass",
        language: "en",
      });
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "Password has been reset successfully!",
        emotion: "positive",
      });
    });
  });

  it("handles API error response", async () => {
    const errorResponse = {
      response: {
        data: { message: "Token expired" },
        status: 400,
      },
    };
    api.post.mockRejectedValueOnce(errorResponse);

    render(<ResetPassword />, { wrapper: Wrapper });

    fireEvent.change(screen.getByPlaceholderText("New Password"), {
      target: { value: "validPass" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), {
      target: { value: "validPass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "Token expired",
        emotion: "negative",
      });
    });
  });

  it("handles network error", async () => {
    api.post.mockRejectedValueOnce(new Error("Network Error"));

    render(<ResetPassword />, { wrapper: Wrapper });

    fireEvent.change(screen.getByPlaceholderText("New Password"), {
      target: { value: "validPass" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), {
      target: { value: "validPass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "An error occurred. Please try again later.",
        emotion: "negative",
      });
    });
  });
});
