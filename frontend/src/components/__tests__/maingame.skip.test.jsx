import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import MainGame from "../../pages/mainGame/maingame";
import { IntlProvider } from "react-intl";
import enMessages from "../../locales/en.json";
import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../../components/popup/popupcontext";
import api from "../../utils/api";

// Provide a minimal stub for indexedDB
global.indexedDB = {
  open: () => ({
    onupgradeneeded: () => {},
    onsuccess: () => {},
  }),
};

// Mock child components to simplify the render tree
vi.mock("../../components/maingame/card/flashcard", () => ({
  default: (props) => (
    <div data-testid="flashcard">
      Flashcard: {props.data ? props.data.word : "no-data"}
    </div>
  ),
}));

vi.mock("../../components/maingame/card/empty-flashcard", () => ({
  default: () => <div data-testid="empty-flashcard">Empty Flashcard</div>,
}));

vi.mock("../../components/maingame/boxex/boxex", () => ({
  default: ({ boxes, handleSetBox, addWords }) => (
    <div data-testid="boxes-container">
      {Object.keys(boxes).map((key) => (
        <button
          key={key}
          data-testid={`box-${key.toLowerCase()}`}
          onClick={() => handleSetBox(key)}
        >
          {key}
        </button>
      ))}
      <button data-testid="add-button" onClick={addWords}>
        Add New Words
      </button>
    </div>
  ),
}));

vi.mock("../../components/progress_bar/progressbar", () => ({
  default: ({ vertical, percent, text }) => (
    <div data-testid="progressbar">
      {text}: {percent}
    </div>
  ),
}));

vi.mock("../../components/confetti/confetti", () => ({
  default: ({ generateConfetti }) => <div data-testid="confetti">Confetti</div>,
}));

vi.mock("../../components/confirm/confirm", () => ({
  default: ({ onClose }) => (
    <button data-testid="confirm-window" onClick={() => onClose(true)}>
      Confirm
    </button>
  ),
}));

// Mock hooks to avoid side effects (IndexedDB, network calls, etc.)
const mockBoxes = {
  boxOne: [{ id: 1, word: "test" }],
  boxTwo: [],
  boxThree: [],
  boxFour: [],
  boxFive: [],
};

vi.mock("../../hooks/boxes/useBoxesDB", () => ({
  default: () => ({
    boxes: mockBoxes,
    setBoxes: vi.fn(),
    setAutoSave: vi.fn(),
  }),
}));

vi.mock("../../hooks/localstorage/usePersistedState", () => ({
  default: () => [1, vi.fn()],
}));

vi.mock("../../hooks/spellchecking/spellchecking", () => ({
  default: () => (user, correct) => user === correct,
}));

vi.mock("../../hooks/activity/countingentries", () => ({
  default: () => {}, // No-op for visit count logic
}));

const moveWordMock = vi.fn();
vi.mock("../../hooks/boxes/useMoveWord", () => ({
  default: () => ({ moveWord: moveWordMock }),
}));

const getNextPatchMock = vi.fn();
vi.mock("../../hooks/boxes/usePatch", () => ({
  default: () => ({ getNextPatch: getNextPatchMock }),
}));

// Mock API get and post methods to return promises with data
vi.mock("../../utils/api", () => ({
  default: {
    get: vi
      .fn()
      .mockResolvedValue({ data: { totalB2Patches: 5, totalC1Patches: 3 } }),
    post: vi.fn().mockResolvedValue({ data: { success: true } }),
  },
}));

// Context values used by MainGame component
const mockSettings = {
  isSoundEnabled: "true",
  calculatePercent: vi.fn(),
  calculateTotalPercent: vi.fn(),
  totalPercentB2: 50,
  totalPercentC1: 30,
  procentC1: 40,
  procentB2: 60,
  isLoggedIn: true,
};

const mockPopup = { setPopup: vi.fn() };

const Wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={enMessages}>
    <SettingsContext.Provider value={mockSettings}>
      <PopupContext.Provider value={mockPopup}>
        {children}
      </PopupContext.Provider>
    </SettingsContext.Provider>
  </IntlProvider>
);

// Tests for MainGame component
describe("MainGame Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the initial layout", async () => {
    render(<MainGame setDisplay={vi.fn()} lvl="B2" />, { wrapper: Wrapper });

    // Check that the return button (showing the 'B2' level) is rendered
    expect(screen.getByText("B2")).toBeInTheDocument();

    // Check for the boxes container
    expect(screen.getByTestId("boxes-container")).toBeInTheDocument();

    // Check that the progress bars are rendered with the correct labels
    const progressBars = screen.getAllByTestId("progressbar");
    expect(progressBars[0]).toHaveTextContent(/daily progress/i);
    expect(progressBars[1]).toHaveTextContent(/total progress/i);

    // Expect a call to fetch patch info
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/word/patch-info");
    });
  });

  it("should handle adding new words", async () => {
    render(<MainGame setDisplay={vi.fn()} lvl="B2" />, { wrapper: Wrapper });
    const addButton = screen.getByTestId("add-button");
    fireEvent.click(addButton);
    await waitFor(() => {
      expect(getNextPatchMock).toHaveBeenCalled();
    });
  });

  it("should handle return button click", () => {
    const setDisplayMock = vi.fn();
    render(<MainGame setDisplay={setDisplayMock} lvl="B2" />, {
      wrapper: Wrapper,
    });

    // Find the return button by its CSS selector
    const returnButton = document.querySelector(".return-btn-voca");
    fireEvent.click(returnButton);
    expect(setDisplayMock).toHaveBeenCalledWith("default");
  });
});
