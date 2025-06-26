import { vi, describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useWindowWidth } from "../../hooks/window_width/windowWidth";

describe("useWindowWidth", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.restoreAllMocks();

    // Set initial window width
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it("should return the current window width", () => {
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current).toBe(1024);
  });

  it("should update the width when the window is resized", () => {
    const { result } = renderHook(() => useWindowWidth());

    // Wrap resize change in act
    act(() => {
      window.innerWidth = 768;
      window.dispatchEvent(new Event("resize"));
    });

    expect(result.current).toBe(768);
  });

  it("should remove the listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useWindowWidth());

    // Get the registered handler
    const handler = addSpy.mock.calls.find((call) => call[0] === "resize")[1];

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("resize", handler);
  });

  it("should handle multiple consecutive resizes", () => {
    const { result } = renderHook(() => useWindowWidth());

    // First resize
    act(() => {
      window.innerWidth = 800;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(800);

    // Second resize
    act(() => {
      window.innerWidth = 600;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(600);
  });

  it("should ignore changes after unmount", () => {
    const { result, unmount } = renderHook(() => useWindowWidth());

    unmount();

    act(() => {
      window.innerWidth = 900;
      window.dispatchEvent(new Event("resize"));
    });

    // State should not change after unmount
    expect(result.current).toBe(1024);
  });
});
