import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import MainGame from "../../pages/mainGame/maingame";
import { IntlProvider } from "react-intl";
import enMessages from "../../locales/en.json";
import { SettingsContext } from "../../pages/settings/properties";
import { PopupContext } from "../../components/popup/popupcontext";
import api from "../../utils/api";

// Ustawienie minimalnego stubu dla indexedDB
global.indexedDB = {
  open: () => ({
    onupgradeneeded: () => {},
    onsuccess: () => {}
  })
};

// Mockowanie komponentów potomnych, aby uprościć drzewo renderowania
vi.mock("../../components/maingame/card/flashcard", () => ({
  default: (props) => (
    <div data-testid="flashcard">
      Flashcard: {props.data ? props.data.word : "no-data"}
    </div>
  )
}));

vi.mock("../../components/maingame/card/empty-flashcard", () => ({
  default: () => <div data-testid="empty-flashcard">Empty Flashcard</div>
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
  )
}));

vi.mock("../../components/progress_bar/progressbar", () => ({
  default: ({ vertical, percent, text }) => (
    <div data-testid="progressbar">
      {text}: {percent}
    </div>
  )
}));

vi.mock("../../components/confetti/confetti", () => ({
  default: ({ generateConfetti }) => (
    <div data-testid="confetti">Confetti</div>
  )
}));

vi.mock("../../components/confirm/confirm", () => ({
  default: ({ onClose }) => (
    <button data-testid="confirm-window" onClick={() => onClose(true)}>
      Confirm
    </button>
  )
}));

// Mockowanie hooków – dzięki temu nie wykonujemy operacji związanych np. z IndexedDB czy network
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
    setAutoSave: vi.fn()
  })
}));

vi.mock("../../hooks/localstorage/usePersistedState", () => ({
  default: () => [1, vi.fn()]
}));

vi.mock("../../hooks/spellchecking/spellchecking", () => ({
  default: () => (user, correct) => user === correct
}));

vi.mock("../../hooks/activity/countingentries", () => ({
  default: () => {} // Nie wykonujemy logiki liczenia odwiedzin
}));

const moveWordMock = vi.fn();
vi.mock("../../hooks/boxes/useMoveWord", () => ({
  default: () => ({
    moveWord: moveWordMock
  })
}));

const getNextPatchMock = vi.fn();
vi.mock("../../hooks/boxes/usePatch", () => ({
  default: () => ({
    getNextPatch: getNextPatchMock
  })
}));

// Mockowanie api, aby get i post zwracały obietnice z danymi
vi.mock("../../utils/api", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: { totalB2Patches: 5, totalC1Patches: 3 }
    }),
    post: vi.fn().mockResolvedValue({ data: { success: true } })
  }
}));

// Ustawienia kontekstowe używane w komponencie
const mockSettings = {
  isSoundEnabled: "true",
  calculatePercent: vi.fn(),
  calculateTotalPercent: vi.fn(), // teraz już nie oczekujemy jej wywołania
  totalPercentB2: 50,
  totalPercentC1: 30,
  procentC1: 40,
  procentB2: 60,
  isLoggedIn: true
};

const mockPopup = {
  setPopup: vi.fn()
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

// Testy komponentu MainGame
describe("MainGame Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render initial layout", async () => {
    render(<MainGame setDisplay={vi.fn()} lvl="B2" />, { wrapper: Wrapper });
    
    // Sprawdzamy czy przycisk powrotu (zawierający poziom B2) jest renderowany
    expect(screen.getByText("B2")).toBeInTheDocument();
    
    // Sprawdzamy obecność kontenera boxów
    expect(screen.getByTestId("boxes-container")).toBeInTheDocument();

    // Sprawdzamy, czy pasek postępu został wyrenderowany.
    // Używamy wyrażeń regularnych, aby dopasować dowolny tekst zawierający fragment "daily progress"
    const progressBars = screen.getAllByTestId("progressbar");
    expect(progressBars[0]).toHaveTextContent(/daily progress/i);
    expect(progressBars[1]).toHaveTextContent(/total progress/i);
    
    // Oczekujemy, że zostanie wywołane pobranie informacji o patchach
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
    render(<MainGame setDisplay={setDisplayMock} lvl="B2" />, { wrapper: Wrapper });
    
    // Znajdujemy przycisk powrotu poprzez selektor CSS
    const returnButton = document.querySelector(".return-btn-voca");
    fireEvent.click(returnButton);
    expect(setDisplayMock).toHaveBeenCalledWith("default");
  });
});
