import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
// Mock the api module
vi.mock("../../utils/api", () => ({
  // If utils/api.js exports default axios instance
  // we provide a default export with a mock post function
  default: {
    post: vi.fn(),
  },
}));

import { SettingsContext } from "../../pages/settings/properties";
import api from "../../utils/api";
import useBoxesDB from "../../hooks/boxes/useBoxesDB";
import "fake-indexeddb/auto";

// Provide mock settings context
const mockSettings = { isLoggedIn: false };
const wrapper = ({ children }) => (
  <SettingsContext.Provider value={mockSettings}>
    {children}
  </SettingsContext.Provider>
);

describe("useBoxesDB hook", () => {
  beforeEach(() => {
    // Clear existing database and mocks before each test
    indexedDB.deleteDatabase("SavedBoxes");
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("initializes with empty boxes when no data", async () => {
    const { result } = renderHook(
      () => useBoxesDB("B2", 1, 1, vi.fn(), vi.fn(), vi.fn()),
      { wrapper }
    );

    // Allow hook effects to run
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    });

    expect(result.current.boxes).toEqual({
      boxOne: [],
      boxTwo: [],
      boxThree: [],
      boxFour: [],
      boxFive: [],
    });
  });

  it("loads existing entries from IndexedDB", async () => {
    // Pre-populate IndexedDB with one record
    const db = await new Promise((resolve) => {
      const request = indexedDB.open("SavedBoxes", 2);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore("boxesB2", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result);
    });

    await new Promise((resolve) => {
      const tx = db.transaction("boxesB2", "readwrite");
      const store = tx.objectStore("boxesB2");
      store.put({ id: 1, word: "test", boxName: "boxOne" });
      tx.oncomplete = resolve;
    });

    const { result } = renderHook(
      () => useBoxesDB("B2", 1, 1, vi.fn(), vi.fn(), vi.fn()),
      { wrapper }
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(result.current.boxes.boxOne).toHaveLength(1);
  });

  it("performs server autoload when user is logged in", async () => {
    mockSettings.isLoggedIn = true;
    // Mock server response with one word and a patchNumber
    api.post.mockResolvedValue({
      data: {
        words: [{ id: 1, word: "server", boxName: "boxOne" }],
        patchNumber: 2,
      },
    });

    const { result } = renderHook(
      () => useBoxesDB("B2", 1, 1, vi.fn(), vi.fn(), vi.fn()),
      { wrapper }
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(api.post).toHaveBeenCalledWith("/user/auto-load", {
      level: "B2",
      deviceId: null,
    });
    expect(result.current.boxes.boxOne).toHaveLength(1);
  });

  it("invokes conflict resolution when timestamps differ", async () => {
    mockSettings.isLoggedIn = true;
    localStorage.setItem("guestTimestamp_B2", Date.now());
    // Server returns an older timestamp
    api.post.mockResolvedValue({
      data: { last_saved: new Date(2020, 0, 1), words: [] },
    });

    const mockShowConfirm = vi.fn().mockResolvedValue(true);

    renderHook(
      () => useBoxesDB("B2", 1, 1, vi.fn(), vi.fn(), mockShowConfirm),
      { wrapper }
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(mockShowConfirm).toHaveBeenCalled();
  });

  it("handles API errors gracefully without crashing", async () => {
    api.post.mockRejectedValue(new Error("Server error"));
    console.error = vi.fn();

    const { result } = renderHook(
      () => useBoxesDB("B2", 1, 1, vi.fn(), vi.fn(), vi.fn()),
      { wrapper }
    );

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(console.error).toHaveBeenCalled();
    expect(result.current.boxes).toBeDefined();
  });
});
