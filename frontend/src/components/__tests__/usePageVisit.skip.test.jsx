import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import usePageVisit from "../../hooks/activity/countingentries";
import api from "../../utils/api";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock API
vi.mock("../../utils/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("usePageVisit hook", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.restoreAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });
    window.localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after tests
    vi.useRealTimers();
  });

  it("should send a request on the first visit", async () => {
    const mockDate = 1620000000000;
    vi.setSystemTime(mockDate);

    api.post.mockResolvedValue({ data: { success: true } });

    renderHook(() => usePageVisit("home"));

    await vi.runAllTimersAsync();

    expect(api.post).toHaveBeenCalledWith("/analytics/visit", {
      page_name: "home",
    });
    expect(localStorage.getItem("lastVisit_home")).toBe(String(mockDate));
  });

  it("should send a request after an hour has passed", async () => {
    const oldDate = 1620000000000;
    const newDate = oldDate + 60 * 60 * 1000 + 1;

    window.localStorage.setItem("lastVisit_about", String(oldDate));
    vi.setSystemTime(newDate);
    api.post.mockResolvedValue({ data: { success: true } });

    renderHook(() => usePageVisit("about"));

    await vi.runAllTimersAsync();

    expect(api.post).toHaveBeenCalled();
    expect(localStorage.getItem("lastVisit_about")).toBe(String(newDate));
  });

  it("should not send a request before an hour has passed", async () => {
    const initialDate = 1620000000000;
    window.localStorage.setItem("lastVisit_contact", String(initialDate));
    vi.setSystemTime(initialDate + 60 * 60 * 1000 - 1);

    renderHook(() => usePageVisit("contact"));

    await vi.runAllTimersAsync();

    expect(api.post).not.toHaveBeenCalled();
    expect(localStorage.getItem("lastVisit_contact")).toBe(String(initialDate));
  });

  it("should handle API errors gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    api.post.mockRejectedValue(new Error("API Error"));

    renderHook(() => usePageVisit("error-page"));

    await vi.runAllTimersAsync();

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error updating visit statistics:",
      expect.any(Error)
    );
    expect(localStorage.getItem("lastVisit_error-page")).toBeNull();
  });

  it("should use unique keys for different pages", async () => {
    const mockDate = 1620000000000;
    vi.setSystemTime(mockDate);
    api.post.mockResolvedValue({ data: { success: true } });

    renderHook(() => usePageVisit("dashboard"));
    await vi.runAllTimersAsync();

    expect(localStorage.getItem("lastVisit_dashboard")).toBe(String(mockDate));
    expect(localStorage.getItem("lastVisit_home")).toBeNull();
  });
});
