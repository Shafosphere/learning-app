// RegiForm.test.jsx
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import RegiForm from "../login/regiForm";
import { PopupContext } from "../popup/popupcontext";
import api from "../../utils/api";

// Mockujemy cały moduł api:
vi.mock("../../utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("RegiForm", () => {
  let mockSetPopup;

  beforeEach(() => {
    mockSetPopup = vi.fn();
    // Czyścimy mocki w każdym teście, aby zaczynać od “czystego” stanu:
    api.get.mockClear();
    api.post.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  /**
   * Funkcja renderująca testowany komponent – 
   * otaczamy go IntlProvider oraz PopupContext.
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

  it("pobiera reguły walidacji przy pierwszym renderowaniu (useEffect)", async () => {
    // Załóżmy, że back-end zwraca takie zasady:
    api.get.mockResolvedValueOnce({
      data: {
        validationRules: {
          USERNAME: { MIN_LENGTH: 3, MAX_LENGTH: 20 },
          PASSWORD: { MIN_LENGTH: 8, MAX_LENGTH: 32 },
        },
      },
    });

    renderComponent();

    // Oczekujemy, że uruchomiono zapytanie do /auth/requirements
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/auth/requirements");
    });
  });

  it("renderuje pola input i przycisk rejestracji", () => {
    renderComponent();

    // Sprawdzamy, czy są odpowiednie pola:
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Confirm the password$/i)).toBeInTheDocument();

    // Oczekujemy, że jest też przycisk "Sign up":
    expect(screen.getByRole("button", { name: /Sign up/i })).toBeInTheDocument();
  });

  it("po kliknięciu ikonek kłódki ukazuje/ukrywa hasło i potwierdzenie hasła", async () => {
    renderComponent();

    const passwordInput = screen.getByPlaceholderText(/^Password$/i);
    const confirmInput = screen.getByPlaceholderText(/^Confirm the password$/i);

    // Domyślnie oba pola są typu "password"
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");

    // Pobieramy wszystkie przyciski bez tekstu (dla ikonki)
    const [togglePassButton, toggleConfirmButton] =
      screen.getAllByRole("button", { name: "" });

    // Klikamy pierwszy przycisk – typ pola hasła zmienia się na "text"
    fireEvent.click(togglePassButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Klikamy drugi przycisk – typ pola potwierdzenia hasła zmienia się na "text"
    fireEvent.click(toggleConfirmButton);
    expect(confirmInput).toHaveAttribute("type", "text");
  });

  it("jeśli hasła nie pasują, ustawia popup z błędem i nie wywołuje rejestracji", async () => {
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

  it("jeśli hasła pasują, wysyła request i ustawia popup o sukcesie w razie powodzenia", async () => {
    // Udajemy, że rejestracja się powiodła
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

  it("jeśli API zwróci błąd, wypisuje go w konsoli (i nie ustawia popup success)", async () => {
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
