import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import RegiForm from "../login/regiForm";
import { PopupContext } from "../popup/popupcontext";
import api from "../../utils/api";

// Mock the entire API module
vi.mock("../../utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("RegiForm Component", () => {
  let mockSetPopup;

  beforeEach(() => {
    mockSetPopup = vi.fn();
    // Clear API mocks before each test to start from a clean state
    api.get.mockClear();
    api.post.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  /**
   * Helper function to render the component within IntlProvider and PopupContext
   */
  function renderComponent() {
    return render(
      <IntlProvider locale="en" messages={{}}>
        <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
          <RegiForm setDisplay={vi.fn()} />
        </PopupContext.Provider>
      </IntlProvider>
    );
  }

  it("should fetch validation rules on initial render (useEffect)", async () => {
    // Assume the backend returns these validation rules
    api.get.mockResolvedValueOnce({
      data: {
        validationRules: {
          USERNAME: { MIN_LENGTH: 3, MAX_LENGTH: 20 },
          PASSWORD: { MIN_LENGTH: 8, MAX_LENGTH: 32 },
        },
      },
    });

    renderComponent();

    // Expect a request to /auth/requirements
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/auth/requirements");
    });
  });

  it("should render input fields and the Sign up button", () => {
    renderComponent();

    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Password$/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/^Confirm the password$/i)
    ).toBeInTheDocument();

    // Expect the "Sign up" button to be present
    expect(
      screen.getByRole("button", { name: /Sign up/i })
    ).toBeInTheDocument();
  });

  it("should toggle password and confirm password visibility when clicking lock icons", async () => {
    renderComponent();

    const passwordInput = screen.getByPlaceholderText(/^Password$/i);
    const confirmInput = screen.getByPlaceholderText(/^Confirm the password$/i);

    // By default, both fields should be of type "password"
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");

    // Get all icon-only buttons (for visibility toggle)
    const [togglePassButton, toggleConfirmButton] = screen.getAllByRole(
      "button",
      { name: "" }
    );

    // Click the first button to change password field type to "text"
    fireEvent.click(togglePassButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click the second button to change confirm password field type to "text"
    fireEvent.click(toggleConfirmButton);
    expect(confirmInput).toHaveAttribute("type", "text");
  });

  it("should set error popup and not call registration if passwords do not match", async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "User123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "email@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), {
      target: { value: "MySecret123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Confirm the password$/i), {
      target: { value: "Mismatch" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign up/i }));

    await waitFor(() => {
      expect(api.post).not.toHaveBeenCalled();
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: expect.stringMatching(/Password does not match/i),
        emotion: "negative",
      });
    });
  });

  it("should send registration request and set success popup on successful response", async () => {
    // Simulate successful registration
    api.post.mockResolvedValueOnce({
      data: { success: true },
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "User123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "email@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), {
      target: { value: "MySecret123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Confirm the password$/i), {
      target: { value: "MySecret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign up/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/register", {
        username: "User123",
        email: "email@example.com",
        password: "MySecret123",
      });
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: expect.stringMatching(/Registration successful/i),
        emotion: "positive",
      });
    });
  });

  it("should log error to console and not set success popup if API returns error", async () => {
    const error = new Error("registration error");
    api.post.mockRejectedValueOnce(error);

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "User123" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Email/i), {
      target: { value: "email@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Password$/i), {
      target: { value: "SecretPass" },
    });
    fireEvent.change(screen.getByPlaceholderText(/^Confirm the password$/i), {
      target: { value: "SecretPass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Sign up/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Registration error:",
        expect.any(Error)
      );
      expect(mockSetPopup).not.toHaveBeenCalledWith({
        message: expect.stringMatching(/Registration successful/i),
        emotion: "positive",
      });
    });

    consoleSpy.mockRestore();
  });
});
