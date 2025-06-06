import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import Settings from "../../pages/settings/settings";
import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../popup/popupcontext";
import { IntlProvider } from "react-intl";
import enMessages from "../../locales/en.json";
import "fake-indexeddb/auto";

// Stub for <dialog> methods – JSDOM doesn't assign the "dialog" role by default
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {};
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {};
  }

  // Replace window.location to stub reload.
  // Save the original object to restore it after tests.
  const originalLocation = window.location;
  delete window.location;
  window.location = {
    ...originalLocation,
    reload: vi.fn(),
  };
});

// Mock API
vi.mock("../../utils/api", () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
  },
}));

const mockSettings = {
  themeMode: "light",
  toggleTheme: vi.fn(),
  isSoundEnabled: "true",
  toggleSound: vi.fn(),
  language: "en",
  setLanguage: vi.fn(),
  dailyGoal: 20,
  setDailyGoal: vi.fn(),
  diacritical: true,
  setDiacritical: vi.fn(),
  spellChecking: false,
  setSpellChecking: vi.fn(),
  isLoggedIn: false,
  logostatus: false,
  toggleLogo: vi.fn(),
  skinstatus: false,
  toggleSkin: vi.fn(),
  calculatePercent: vi.fn(),
  resetDateIfNeeded: vi.fn(),
};

const mockPopup = {
  setPopup: vi.fn(),
};

const Wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={enMessages}>
    <SettingsContext.Provider value={mockSettings}>
      <PopupContext.Provider value={mockPopup}>
        {children}
      </PopupContext.Provider>
    </SettingsContext.Provider>
  </IntlProvider>
);

describe("Settings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should render all tabs", () => {
    render(<Settings />, { wrapper: Wrapper });
    // The component has no text labels for tabs, so we expect tab numbers only.
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("should switch between tabs correctly", () => {
    render(<Settings />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText("2"));
    // Find the container with the "Daily Progress" text, then a spinbutton input inside it.
    const dailyGoalContainer = screen
      .getByText(enMessages["dailyProgress"])
      .closest(".dailyGoal");
    const dailyGoalInput = within(dailyGoalContainer).getByRole("spinbutton");
    expect(dailyGoalInput).toBeInTheDocument();

    fireEvent.click(screen.getByText("3"));
    expect(screen.getByText(enMessages["resetAll"])).toBeInTheDocument();
  });

  describe("First Tab", () => {
    it("should toggle sound settings", () => {
      render(<Settings />, { wrapper: Wrapper });
      // Find the element with "Sounds" text and the checkbox inside its container.
      const soundContainer = screen
        .getByText(enMessages["sounds"])
        .closest(".switch-container");
      const soundToggle = within(soundContainer).getByRole("checkbox");
      fireEvent.click(soundToggle);
      expect(mockSettings.toggleSound).toHaveBeenCalled();
    });

    it("should change language", () => {
      render(<Settings />, { wrapper: Wrapper });
      const polishFlag = screen.getByAltText("polish");
      const englishFlag = screen.getByAltText("english");

      fireEvent.click(polishFlag);
      expect(mockSettings.setLanguage).toHaveBeenCalledWith("pl");

      fireEvent.click(englishFlag);
      expect(mockSettings.setLanguage).toHaveBeenCalledWith("en");
    });
  });

  describe("Second Tab", () => {
    it("should update daily goal and save", async () => {
      render(<Settings />, { wrapper: Wrapper });
      fireEvent.click(screen.getByText("2"));

      // Find the input in the Daily Progress container.
      const dailyGoalContainer = screen
        .getByText(enMessages["dailyProgress"])
        .closest(".dailyGoal");
      const input = within(dailyGoalContainer).getByRole("spinbutton");
      fireEvent.change(input, { target: { value: "30" } });

      const saveButton = screen.getByText(enMessages["saveSettings"]);
      fireEvent.click(saveButton);

      // Expect setDailyGoal to be called with the string "30".
      expect(mockSettings.setDailyGoal).toHaveBeenCalledWith("30");
      expect(mockPopup.setPopup).toHaveBeenCalledWith({
        message: enMessages["settings.saved"],
        emotion: "positive",
      });
    });
  });

  describe("Third Tab", () => {
    let container;
    beforeEach(() => {
      // Settings for reset tests
      localStorage.setItem("carouselItems-B2", "test");
      localStorage.setItem("patchNumberB2-maingame", "2");
      const rendered = render(<Settings />, { wrapper: Wrapper });
      container = rendered.container;
    });

    it("should reset vocabulary progress", async () => {
      fireEvent.click(screen.getByText("3"));
      // Find the reset vocabulary button inside its container.
      const vocaContainer = screen
        .getByText(enMessages["switches.resetVoca"])
        .closest(".container-resets");
      const vocaButton = within(vocaContainer)
        .getByText(enMessages["switches.buttonB2"])
        .closest("button");
      fireEvent.click(vocaButton);

      // Wait for the dialog to appear.
      await waitFor(() => {
        expect(container.querySelector("dialog")).toBeTruthy();
      });
      const confirmDialog = container.querySelector("dialog");
      // Click the "Yes" button inside the dialog.
      const yesButton = within(confirmDialog).getByText(
        enMessages["confirm.yes"]
      );
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(localStorage.getItem("carouselItems-B2")).toBeNull();
      });
    });

    it("should reset flashcards progress", async () => {
      fireEvent.click(screen.getByText("3"));
      const flashContainer = screen
        .getByText(enMessages["switches.resetFlash"])
        .closest(".container-resets");
      const flashButton = within(flashContainer)
        .getByText("B2")
        .closest("button");
      fireEvent.click(flashButton);

      await waitFor(() => {
        expect(container.querySelector("dialog")).toBeTruthy();
      });
      const confirmDialog = container.querySelector("dialog");
      const yesButton = within(confirmDialog).getByText(
        enMessages["confirm.yes"]
      );
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(localStorage.getItem("patchNumberB2-maingame")).toBe("1");
      });
    });
  });

  describe("IndexedDB Cleanup", () => {
    it("should clear localStorage and call location.reload", async () => {
      const { container } = render(<Settings />, { wrapper: Wrapper });
      fireEvent.click(screen.getByText("3"));

      const resetAllButton = screen.getByText(enMessages["resetAll"]);
      fireEvent.click(resetAllButton);

      await waitFor(() => {
        expect(container.querySelector("dialog")).toBeTruthy();
      });
      const confirmDialog = container.querySelector("dialog");
      const yesButton = within(confirmDialog).getByText(
        enMessages["confirm.yes"]
      );
      fireEvent.click(yesButton);

      await waitFor(() => {
        expect(localStorage.length).toBe(0);
      });
      // Check that reload was called
      expect(window.location.reload).toHaveBeenCalled();
    });
  });

  it("should display correct explanations on hover", () => {
    render(<Settings />, { wrapper: Wrapper });

    // Explanation for sound
    const soundContainer = screen
      .getByText(enMessages["sounds"])
      .closest(".switch-container");
    fireEvent.mouseEnter(soundContainer);
    expect(
      screen.getByText(enMessages["turnOffSoundEffects"])
    ).toBeInTheDocument();

    // Explanation for dark mode
    const darkModeContainer = screen
      .getByText(enMessages["darkMode"])
      .closest(".switch-container");
    fireEvent.mouseEnter(darkModeContainer);
    expect(screen.getByText(enMessages["mode"])).toBeInTheDocument();
  });
});
