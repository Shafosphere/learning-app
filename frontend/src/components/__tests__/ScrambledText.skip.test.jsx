import { render, screen, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import ScrambledText from "../arena/ScrambledText";

describe("ScrambledText", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should display the initial text without animation", () => {
    render(<ScrambledText text="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("should animate text change with random characters", () => {
    const { rerender } = render(<ScrambledText text="Hi" />);
    rerender(<ScrambledText text="Bye" />);

    // First animation step (30ms)
    act(() => vi.advanceTimersByTime(30));
    // For "Bye" (length=3): currentLength = round(2 + (3-2)*(30/1500)) = round(2.02) = 2
    expect(screen.getByTestId("scrambled-text").textContent).toBe("AA");

    // Mid animation (750ms)
    act(() => vi.advanceTimersByTime(720));
    // At this point, currentLength should be 3, and the result should be three characters
    expect(screen.getByTestId("scrambled-text").textContent).toMatch(
      /^[A-Z0-9]{3}$/
    );

    // End of animation (1500ms)
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByTestId("scrambled-text").textContent).toBe("Bye");
  });

  it("should clear the interval on unmount when the animation has started", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const { rerender, unmount } = render(<ScrambledText text="Test" />);

    // Change text to trigger animation
    rerender(<ScrambledText text="Test Changed" />);

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("should interrupt an existing animation when text changes again", () => {
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");
    const { rerender } = render(<ScrambledText text="First" />);

    rerender(<ScrambledText text="Second" />);
    rerender(<ScrambledText text="Third" />);

    // We expect clearInterval to be called once (when changing from "Second" to "Third")
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it("should handle empty text", () => {
    render(<ScrambledText text="" />);
    expect(screen.getByTestId("scrambled-text")).toHaveTextContent("");
  });

  it("should correctly interpolate different text lengths", () => {
    const { rerender } = render(<ScrambledText text="Short" />);

    // Changing text from "Short" (length 5) to "Longer text" (length 11)
    rerender(<ScrambledText text="Longer text" />);
    // To let currentLength exceed 5, advance by 150ms
    act(() => vi.advanceTimersByTime(150));

    const scrambled = screen.getByTestId("scrambled-text").textContent;
    expect(scrambled).toMatch(/^[A-Z0-9]+$/);
    expect(scrambled.length).toBeGreaterThan(5);
  });
});
