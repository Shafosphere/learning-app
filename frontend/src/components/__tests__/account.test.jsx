import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event"; // Dodany brakujący import
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Account from "../../pages/account/account";
import { IntlProvider } from "react-intl";
import enMessages from "../../locales/en.json";
import { PopupContext } from "../../components/popup/popupcontext";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { useWindowWidth } from "../../hooks/window_width/windowWidth";

// Mock avatar images
vi.mock("../../data/avatars/man.png", () => ({ default: "man.png" }));
vi.mock("../../data/avatars/man_1.png", () => ({ default: "man_1.png" }));
vi.mock("../../data/avatars/woman.png", () => ({ default: "woman.png" }));
vi.mock("../../data/avatars/woman_1.png", () => ({ default: "woman_1.png" }));

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("../../hooks/window_width/windowWidth", () => ({
  useWindowWidth: vi.fn().mockReturnValue(1024),
}));

vi.mock("../../utils/api", () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("../../components/confirm/confirm", () => ({
  default: ({ message, onClose }) => (
    <div data-testid="confirm-window">
      {message}
      <button onClick={() => onClose(true)}>Yes</button>
    </div>
  ),
}));

vi.mock("../../components/button/button", () => ({
  default: ({ message, disabled, onClick }) => (
    <button disabled={disabled} onClick={onClick}>
      {message}
    </button>
  ),
}));

const mockNavigate = vi.fn();
const mockSetPopup = vi.fn();
vi.mocked(useNavigate).mockReturnValue(mockNavigate);

const Wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={enMessages}>
    <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
      {children}
    </PopupContext.Provider>
  </IntlProvider>
);

describe("Account Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.post.mockResolvedValue({
      data: { username: "testuser", email: "test@example.com", avatar: 1 },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = () => render(<Account />, { wrapper: Wrapper });

  async function findInputByLabel(labelRegex, occurrence = 0) {
    const labelSpans = await screen.findAllByText(labelRegex);
    const labelSpan = labelSpans[occurrence];
    const group = labelSpan.closest(".input-group");
    return group.querySelector("input");
  }

  it("should load user data on mount", async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/auth/information");
      expect(screen.getByDisplayValue("testuser")).toBeInTheDocument();
      expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it("should update input fields and enable save button", async () => {
    renderComponent();
    const usernameInput = await findInputByLabel(/username/i);
    
    await act(async () => {
      await userEvent.clear(usernameInput);
      await userEvent.type(usernameInput, "newuser");
    });

    await waitFor(() => {
      expect(usernameInput).toHaveValue("newuser");
      expect(screen.getByText("SAVE CHANGES")).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it("should toggle password visibility", async () => {
    renderComponent();
    const oldPassInput = await findInputByLabel(/old password/i);
    const toggleBtn = oldPassInput.closest(".input-group").querySelector(".btn-pass-acc");
    
    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    expect(oldPassInput).toHaveAttribute("type", "text");
  });

  it("should change avatar", async () => {
    const { container } = renderComponent();
    await findInputByLabel(/username/i);
    const arrows = container.querySelectorAll(".avatar-arrow");
    
    await act(async () => {
      fireEvent.click(arrows[1]);
    });

    await waitFor(() => {
      const avatarImg = screen.getByAltText("avatar");
      expect(avatarImg.src).toContain("man_1.png");
    }, { timeout: 3000 });
  });

  it("should show confirmation on delete", async () => {
    renderComponent();
    
    await act(async () => {
      fireEvent.click(await screen.findByText(/delete account/i));
    });

    expect(await screen.findByTestId("confirm-window")).toBeInTheDocument();
  });

//   it("should call delete API on confirmation", async () => {
//     vi.useFakeTimers();
//     api.delete.mockResolvedValue({ data: { success: true } });
//     renderComponent();

//     fireEvent.click(await screen.findByText(/delete account/i));
//     fireEvent.click(await screen.findByText("Yes"));

//     await waitFor(() => {
//       expect(api.delete).toHaveBeenCalledWith("/auth/delete");
//     }, { timeout: 3000 });

//     act(() => {
//       vi.advanceTimersByTime(2500);
//     });

//     await waitFor(() => {
//       expect(mockNavigate).toHaveBeenCalledWith("/login");
//     }, { timeout: 3000 });
//   }, 10000);

  it("should handle save with validation (success=false)", async () => {
    api.patch.mockResolvedValue({ data: { success: false } });
    renderComponent();

    // Wypełnij wymagane pola
    const newPassInput = await findInputByLabel(/new password/i);
    const confirmInput = await findInputByLabel(/confirm new password/i);
    
    await act(async () => {
      await userEvent.type(newPassInput, "newpass123");
      await userEvent.type(confirmInput, "newpass123");
    });

    fireEvent.click(await screen.findByText(/save changes/i));
    fireEvent.click(await screen.findByText("Yes"));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "Failed to save changes.",
        emotion: "warning",
      });
    }, { timeout: 5000 });
  }, 10000);

  it("should switch tabs on mobile", async () => {
    useWindowWidth.mockReturnValue(600);
    renderComponent();

    const tab2 = await screen.findByText("2", {}, { timeout: 3000 });
    fireEvent.click(tab2);

    await waitFor(() => {
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
      expect(screen.getByText(/avatar/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  }, 10000);

  it("should show error popup on API failure", async () => {
    api.patch.mockRejectedValue(new Error("API Error"));
    renderComponent();

    // Zmień wartość pola aby aktywować przycisk
    const usernameInput = await findInputByLabel(/username/i);
    await act(async () => {
      await userEvent.type(usernameInput, "updated_username");
    });

    fireEvent.click(await screen.findByText(/save changes/i));
    fireEvent.click(await screen.findByText("Yes"));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: "An error occurred.",
        emotion: "negative",
      });
    }, { timeout: 5000 });
  }, 10000);
});