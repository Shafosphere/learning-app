import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { IntlProvider } from "react-intl";
import Sidebar from "../sidebar/sidebar";
import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../popup/popupcontext";
import api from "../../utils/api";

// Mocking the entire API module
vi.mock("../../utils/api", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: {} })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
    interceptors: {
      response: { use: vi.fn() },
    },
  },
}));

// Mocking icons
vi.mock("react-icons/io5", () => ({
  IoBug: () => <div data-testid="bug-icon" />,
  IoLogoGithub: () => <div data-testid="github-icon" />,
}));

// Mocking the popup
vi.mock("../report/report-popup", () => ({
  default: vi.fn(() => <div data-testid="report-popup" />),
}));

const mockSettings = {
  isLoggedIn: false,
  setIsLoggedIn: vi.fn(),
  setUser: vi.fn(),
  toggleTheme: vi.fn(),
  logostatus: true,
};

const mockPopup = {
  setPopup: vi.fn(),
};

const renderSidebar = (settingsOverrides = {}) => {
  return render(
    <MemoryRouter>
      <IntlProvider locale="en">
        <SettingsContext.Provider
          value={{ ...mockSettings, ...settingsOverrides }}
        >
          <PopupContext.Provider value={mockPopup}>
            <Sidebar />
          </PopupContext.Provider>
        </SettingsContext.Provider>
      </IntlProvider>
    </MemoryRouter>
  );
};

describe("Sidebar component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockReset();
    api.post.mockReset();
  });

  it("renders basic elements", () => {
    renderSidebar();

    expect(screen.getByText("emolingo")).toBeInTheDocument();
    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("shows login link when logged out", () => {
    renderSidebar();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("shows logout and report bug when logged in", () => {
    renderSidebar({ isLoggedIn: true });
    expect(screen.getByText("Logout")).toBeInTheDocument();
    expect(screen.getByText("Report a bug")).toBeInTheDocument();
  });

  it("toggles theme on dark mode click", async () => {
    const toggleMock = vi.fn();
    renderSidebar({ toggleTheme: toggleMock });

    await userEvent.click(screen.getByText("Dark Mode"));
    expect(toggleMock).toHaveBeenCalledTimes(1);
  });

  it("handles admin check API call", async () => {
    api.get.mockResolvedValueOnce({ data: { success: true } });
    renderSidebar({ isLoggedIn: true });

    await waitFor(() => {
      expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    });
  });

  it("handles logout correctly", async () => {
    api.post.mockResolvedValueOnce({});
    renderSidebar({ isLoggedIn: true });

    await userEvent.click(screen.getByText("Logout"));
    expect(api.post).toHaveBeenCalledWith("/auth/logout");
  });

  it("opens report popup", async () => {
    renderSidebar({ isLoggedIn: true });

    await userEvent.click(screen.getByText("Report a bug"));
    expect(screen.getByTestId("report-popup")).toBeInTheDocument();
  });

  it("has working GitHub link", () => {
    renderSidebar();
    const link = screen.getByText("GitHub").closest("a");

    expect(link).toHaveAttribute("href", "https://github.com/Shafosphere");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
