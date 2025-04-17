// LoginForm.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import LoginForm from "../login/loginForm";
import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../../components/popup/popupcontext";

// 1. Definiujemy zmienną mockNavigate na poziomie modułu:
let mockNavigate = vi.fn();

// 2. Mockujemy react-router-dom. Musi być wykonane przed importami zależnymi.
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// 3. Mock modułu api
vi.mock("../../utils/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("LoginForm component", () => {
  let mockSetIsLoggedIn;
  let mockSetUser;
  let mockSetPopup;
  let api;

  beforeEach(async () => {
    mockNavigate.mockClear();
    mockSetIsLoggedIn = vi.fn();
    mockSetUser = vi.fn();
    mockSetPopup = vi.fn();

    // Pobieramy nasz zmockowany moduł
    api = (await import("../../utils/api")).default;
    api.post.mockClear();
  });

  /**
   * Funkcja renderująca testowany komponent.
   * Dodajemy IntlProvider, by wstrzyknąć `intl` dla react-intl.
   */
  function renderComponent(initialPath = "/") {
    return render(
      <IntlProvider locale="en">
        <SettingsContext.Provider
          value={{
            setIsLoggedIn: mockSetIsLoggedIn,
            setUser: mockSetUser,
          }}
        >
          <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
            <MemoryRouter initialEntries={[initialPath]}>
              <Routes>
                <Route path="/" element={<LoginForm />} />
              </Routes>
            </MemoryRouter>
          </PopupContext.Provider>
        </SettingsContext.Provider>
      </IntlProvider>
    );
  }

  it("renderuje pola login i hasło oraz przycisk logowania", () => {
    renderComponent();

    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const loginButton = screen.getByRole("button", { name: /Log in/i });

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
  });

  it("domyślnie hasło jest ukryte i można je wyświetlić", () => {
    renderComponent();

    const passwordInput = screen.getByPlaceholderText(/password/i);
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", { name: "" });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");
  });

  it("po wprowadzeniu loginu i hasła formularz wysyła request do API i ustawia stan aplikacji", async () => {
    api.post.mockResolvedValueOnce({
      data: { success: true },
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testUser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "testPassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/login", {
        username: "testUser",
        password: "testPassword",
      });
      expect(mockSetIsLoggedIn).toHaveBeenCalledWith(true);
      expect(mockSetUser).toHaveBeenCalledWith({ username: "testUser" });
      expect(mockNavigate).toHaveBeenCalledWith("/about");
      expect(mockSetPopup).toHaveBeenCalled();
    });
  });

  it("jeśli API zwróci błąd, nie ustawia stanu aplikacji, a w konsoli pojawia się błąd", async () => {
    api.post.mockRejectedValueOnce(new Error("Błąd logowania"));
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "wrongUser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "wrongPassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
      expect(mockSetIsLoggedIn).not.toHaveBeenCalled();
      expect(mockSetUser).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockSetPopup).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it("przekierowuje do ścieżki z parametru redirectTo, jeśli istnieje", async () => {
    api.post.mockResolvedValueOnce({ data: { success: true } });
    renderComponent("/?redirectTo=%2Fdashboard");

    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: "testUser2" },
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: "testPassword2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });
});
