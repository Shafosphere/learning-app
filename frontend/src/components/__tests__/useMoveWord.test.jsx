// src/components/__tests__/useMoveWord.test.jsx

import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import useMoveWord from "../../hooks/boxes/useMoveWord";

// Import, żeby dało się wywołać vi.mocked(getAllWords)
import { addWord, getAllWords } from "../../utils/indexedDB";

// Mockujemy moduł 'indexedDB'
vi.mock("../../utils/indexedDB", () => ({
  __esModule: true,
  addWord: vi.fn(),
  getAllWords: vi.fn().mockResolvedValue([]),
}));

describe("useMoveWord", () => {
  const mockDependencies = {
    boxes: {
      // Domyślnie w boxOne mamy 1 obiekt
      boxOne: [{ id: 1, wordPl: { word: "test" }, wordEng: { word: "test" } }],
      boxTwo: [],
      boxThree: [],
      boxFour: [],
      boxFive: [],
    },
    setBoxes: vi.fn(),
    activeBox: "boxOne",
    randomWord: { id: 1, wordPl: { word: "test" }, wordEng: { word: "test" } },
    setRandom: vi.fn(),
    lvl: "B2",
    confettiShow: vi.fn(),
    calculatePercent: vi.fn(),
    calculateTotalPercent: vi.fn(),
    isLoggedIn: false,
    sendLearnedWordToServer: vi.fn().mockResolvedValue({}),
    setAutoSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should move word to next box", async () => {
    const { result } = renderHook(() => useMoveWord(mockDependencies));

    await act(async () => {
      await result.current.moveWord("test");
    });

    expect(mockDependencies.setBoxes).toHaveBeenCalledWith(expect.any(Function));

    // Wywołujemy callback, by sprawdzić nowy stan
    const setBoxesCallback = mockDependencies.setBoxes.mock.calls[0][0];
    const newState = setBoxesCallback(mockDependencies.boxes);

    expect(newState.boxOne).toHaveLength(0);
    expect(newState.boxTwo).toHaveLength(1);
    expect(mockDependencies.setAutoSave).toHaveBeenCalledWith(true);
  });

  it("should reset word to first box when moveToFirst is true", async () => {
    // Usuwamy oryginalny obiekt z boxOne, by nie duplikować
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxTwo",
      boxes: {
        boxOne: [], // <--- puste, aby obiekt był TYLKO w boxTwo
        boxTwo: [
          {
            id: 1,
            wordPl: { word: "test" },
            wordEng: { word: "test" },
          },
        ],
        boxThree: [],
        boxFour: [],
        boxFive: [],
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      // moveWord("test", true) => przeniesienie do boxOne
      await result.current.moveWord("test", true);
    });

    // Sprawdzamy wynik callbacka setBoxes
    const setBoxesCallback = mockDependencies.setBoxes.mock.calls[0][0];
    const newState = setBoxesCallback(customDeps.boxes);

    expect(newState.boxTwo).toHaveLength(0);
    expect(newState.boxOne).toHaveLength(1);
  });

  it("should handle boxFive correctly and add to learned words", async () => {
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxFive",
      boxes: {
        ...mockDependencies.boxes,
        boxFive: [mockDependencies.boxes.boxOne[0]],
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      await result.current.moveWord("test");
    });

    expect(mockDependencies.confettiShow).toHaveBeenCalled();
    expect(mockDependencies.calculatePercent).toHaveBeenCalledWith("B2");
    expect(mockDependencies.calculateTotalPercent).toHaveBeenCalledWith("B2");
    // bo isLoggedIn=false, więc brak sendLearnedWordToServer
    expect(mockDependencies.sendLearnedWordToServer).not.toHaveBeenCalled();
  });

  it("should call server when user is logged in and word reaches boxFive", async () => {
    const customDeps = {
      ...mockDependencies,
      isLoggedIn: true,
      activeBox: "boxFive",
      boxes: {
        ...mockDependencies.boxes,
        boxFive: [mockDependencies.boxes.boxOne[0]],
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      await result.current.moveWord("test");
    });

    // Teraz user jest zalogowany => sendLearnedWordToServer
    expect(mockDependencies.sendLearnedWordToServer).toHaveBeenCalledWith(1);
  });

  it("should not move word from boxOne to boxOne", async () => {
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxOne",
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      // moveToFirst, ale activeBox to boxOne, nic się nie dzieje
      await result.current.moveWord("test", true);
    });

    // Nic nie przeniesiono
    expect(mockDependencies.setBoxes).not.toHaveBeenCalled();
  });

  it("should clear random word when last word is removed from boxFive", async () => {
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxFive",
      boxes: {
        ...mockDependencies.boxes,
        boxFive: [mockDependencies.boxes.boxOne[0]],
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      await result.current.moveWord("test");
    });

    const setBoxesCallback = mockDependencies.setBoxes.mock.calls[0][0];
    const newState = setBoxesCallback(customDeps.boxes);

    // boxFive puste => randomWord nulujemy
    expect(newState.boxFive).toHaveLength(0);
    expect(mockDependencies.setRandom).toHaveBeenCalledWith(null);
  });

  it("should handle database errors gracefully", async () => {
    // Błąd w getAllWords
    const error = new Error("Database error");
    vi.mocked(getAllWords).mockRejectedValueOnce(error);

    // Podmieniamy console.error, by test mógł sprawdzić
    console.error = vi.fn();

    // Konfigurujemy deps: przenosimy z boxFive
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxFive",
      boxes: {
        ...mockDependencies.boxes,
        boxFive: [mockDependencies.boxes.boxOne[0]],
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      // Gdy dojdzie do getAllWords, wyrzuci błąd
      await result.current.moveWord("test");
    });

    // Oczekujemy, że błąd został wypisany (hook powinien mieć try/catch i console.error)
    expect(console.error).toHaveBeenCalledWith(error);
  });
});
