import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import useMoveWord from "../../hooks/boxes/useMoveWord";

// Import to allow mocking of getAllWords
import { addWord, getAllWords } from "../../utils/indexedDB";

// Mock the indexedDB utilities module
vi.mock("../../utils/indexedDB", () => ({
  __esModule: true,
  addWord: vi.fn(),
  getAllWords: vi.fn().mockResolvedValue([]),
}));

describe("useMoveWord hook", () => {
  const mockDependencies = {
    // Initially, boxOne contains a single item
    boxes: {
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
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it("should move word from current box to next box", async () => {
    const { result } = renderHook(() => useMoveWord(mockDependencies));

    await act(async () => {
      await result.current.moveWord("test");
    });

    // Expect setBoxes to be called with an updater function
    expect(mockDependencies.setBoxes).toHaveBeenCalledWith(
      expect.any(Function)
    );

    // Simulate calling the updater function to inspect new state
    const updater = mockDependencies.setBoxes.mock.calls[0][0];
    const newState = updater(mockDependencies.boxes);

    expect(newState.boxOne).toHaveLength(0);
    expect(newState.boxTwo).toHaveLength(1);
    expect(mockDependencies.setAutoSave).toHaveBeenCalledWith(true);
  });

  it("should reset word to first box when moveToFirst is true", async () => {
    // Configure dependencies with activeBox 'boxTwo' and content only in boxTwo
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxTwo",
      boxes: {
        boxOne: [],
        boxTwo: [
          { id: 1, wordPl: { word: "test" }, wordEng: { word: "test" } },
        ],
        boxThree: [],
        boxFour: [],
        boxFive: [],
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      // moveWord with moveToFirst should send item back to boxOne
      await result.current.moveWord("test", true);
    });

    const updater = mockDependencies.setBoxes.mock.calls[0][0];
    const newState = updater(customDeps.boxes);

    expect(newState.boxTwo).toHaveLength(0);
    expect(newState.boxOne).toHaveLength(1);
  });

  it("should handle moving a word out of the final box and add to learned words", async () => {
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxFive",
      boxes: {
        ...mockDependencies.boxes,
        boxFive: mockDependencies.boxes.boxOne,
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      await result.current.moveWord("test");
    });

    expect(mockDependencies.confettiShow).toHaveBeenCalled();
    expect(mockDependencies.calculatePercent).toHaveBeenCalledWith("B2");
    expect(mockDependencies.calculateTotalPercent).toHaveBeenCalledWith("B2");
    // since isLoggedIn=false, sendLearnedWordToServer should not be called
    expect(mockDependencies.sendLearnedWordToServer).not.toHaveBeenCalled();
  });

  it("should call server to record learned word when user is logged in and word reaches final box", async () => {
    const customDeps = {
      ...mockDependencies,
      isLoggedIn: true,
      activeBox: "boxFive",
      boxes: {
        ...mockDependencies.boxes,
        boxFive: mockDependencies.boxes.boxOne,
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      await result.current.moveWord("test");
    });

    // User is logged in => sendLearnedWordToServer should be called with word ID
    expect(mockDependencies.sendLearnedWordToServer).toHaveBeenCalledWith(1);
  });

  it("should not move a word from boxOne back to boxOne", async () => {
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxOne",
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      // moveToFirst but activeBox is boxOne => no changes
      await result.current.moveWord("test", true);
    });

    expect(mockDependencies.setBoxes).not.toHaveBeenCalled();
  });

  it("should clear the randomWord when last item is removed from final box", async () => {
    const customDeps = {
      ...mockDependencies,
      activeBox: "boxFive",
      boxes: {
        ...mockDependencies.boxes,
        boxFive: mockDependencies.boxes.boxOne,
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      await result.current.moveWord("test");
    });

    const updater = mockDependencies.setBoxes.mock.calls[0][0];
    const newState = updater(customDeps.boxes);

    expect(newState.boxFive).toHaveLength(0);
    expect(mockDependencies.setRandom).toHaveBeenCalledWith(null);
  });

  it("should handle database errors gracefully", async () => {
    // Simulate error in getAllWords
    const error = new Error("Database error");
    vi.mocked(getAllWords).mockRejectedValueOnce(error);

    console.error = vi.fn();

    const customDeps = {
      ...mockDependencies,
      activeBox: "boxFive",
      boxes: {
        ...mockDependencies.boxes,
        boxFive: mockDependencies.boxes.boxOne,
      },
    };

    const { result } = renderHook(() => useMoveWord(customDeps));

    await act(async () => {
      // getAllWords will reject, hook should catch and log error
      await result.current.moveWord("test");
    });

    expect(console.error).toHaveBeenCalledWith(error);
  });
});
