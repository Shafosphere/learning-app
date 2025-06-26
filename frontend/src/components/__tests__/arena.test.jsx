// src/components/__tests__/arena.test.jsx

import {
  render,
  screen,
  waitFor,
  act,
  fireEvent,
} from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Component under test
import ArenaContent from "../arena/arena";

// Mocked modules
import api from "../../utils/api";
import { useWindowWidth } from "../../hooks/window_width/windowWidth";

// Mock API module for GET and POST requests
vi.mock("../../utils/api");

// Mock window width hook for responsive behavior
vi.mock("../../hooks/window_width/windowWidth", () => ({
  useWindowWidth: vi.fn(),
}));

// Mock ScrambledText component to display text immediately without animation
vi.mock("../arena/ScrambledText", () => ({
  default: ({ text }) => <span>{text}</span>,
}));

// Mock chart component
vi.mock("../arena/chart", () => ({
  default: () => <div data-testid="chart" />,
}));

// Helper to set window width for tests
const mockWindowWidth = (width) => {
  useWindowWidth.mockReturnValue(width);
};

describe("ArenaContent Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowWidth(1024);

    // Default GET responses
    api.get.mockImplementation((url) => {
      if (url === "/word/history") {
        return Promise.resolve({ data: [10, 20, 30] });
      }
      if (url === "/word/random-words?count=10") {
        return Promise.resolve({ data: Array(10).fill({ content: "test" }) });
      }
      if (url === "/word/ranking-word") {
        return Promise.resolve({ data: [1, "test", "pl"] }); // [wordId, text, lang]
      }
      return Promise.resolve({ data: [] });
    });

    // Default POST response for answers
    api.post.mockResolvedValue({
      data: {
        success: true,
        newPoints: 40,
        correctTranslations: [{ translation: "przetłumaczone" }],
        isCorrect: true,
      },
    });
  });

  it("fetches initial data on mount", async () => {
    render(<ArenaContent />);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/word/history");
      expect(api.get).toHaveBeenCalledWith("/word/random-words?count=10");
      expect(api.get).toHaveBeenCalledWith("/word/ranking-word");
    });
  });

  it("handles correct answer submission", async () => {
    render(<ArenaContent />);

    // Wait for the input to appear
    await waitFor(() => screen.getByRole("textbox"));

    const input = screen.getByRole("textbox");
    const button = screen.getByRole("button", { name: /confirm/i });

    // Fill and submit answer
    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.click(button);
    });

    // Verify POST request parameters
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith("/word/submit-answer", {
        wordId: 1,
        userAnswer: "test",
        lang: "en",
        startTime: expect.any(Number),
      });
    });

    // Check correct translation and points display
    expect(screen.getByText("przetłumaczone")).toBeInTheDocument();
    const points = await screen.findByText("40");
    expect(points).toBeInTheDocument();
  });

  it("updates card animations after submission", async () => {
    render(<ArenaContent />);

    // Wait for the textbox
    await waitFor(() => screen.getByRole("textbox"));

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    });

    // Expect both scrambled and translated texts to appear in cards
    await waitFor(() => {
      const cards = screen.getAllByText(/test|przetłumaczone/);
      expect(cards.length).toBeGreaterThan(5);
    });
  });

  it("adjusts card animations for narrow screens", async () => {
    mockWindowWidth(500);
    render(<ArenaContent />);

    // Wait for textbox
    await waitFor(() => screen.getByRole("textbox"));

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    });

    // First card should have no transform on narrow screens
    const cards = screen.getAllByText(/test/);
    expect(cards[0]).toHaveStyle("transform: translateY(0rem) rotate(0deg)");
  });

  it("handles API errors gracefully", async () => {
    api.post.mockRejectedValue(new Error("API error"));
    console.error = vi.fn();

    render(<ArenaContent />);

    // Wait for the textbox
    await waitFor(() => screen.getByRole("textbox"));

    const input = screen.getByRole("textbox");
    await act(async () => {
      fireEvent.change(input, { target: { value: "test" } });
      fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    });

    // Verify console.error is called
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });

  it("displays correct flag icons before and after submission", async () => {
    render(<ArenaContent />);

    await waitFor(() => {
      expect(screen.getByAltText("english")).toBeInTheDocument();
    });

    // Change mock ranking response language to English
    api.get.mockImplementationOnce(() =>
      Promise.resolve({ data: [1, "test", "en"] })
    );

    // Submit answer
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /confirm/i }));
    });

    await waitFor(() => {
      expect(screen.getByAltText("polish")).toBeInTheDocument();
    });
  });

  it("disables confirm button during loading state", async () => {
    render(<ArenaContent />);
    await waitFor(() =>
      expect(screen.getByAltText("english")).toBeInTheDocument()
    );

    // Control POST promise resolution manually
    let resolvePost;
    api.post.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePost = resolve;
        })
    );

    const button = screen.getByRole("button", { name: /confirm/i });
    expect(button).not.toBeDisabled();

    // Click to start loading
    await act(async () => {
      fireEvent.click(button);
      // Allow state update for loading
      await new Promise((r) => setTimeout(r, 50));
    });

    // Button should now be disabled
    await waitFor(() => {
      expect(button).toBeDisabled();
    });

    // Resolve POST, loading should end
    act(() => {
      resolvePost({
        data: {
          success: true,
          newPoints: 40,
          correctTranslations: [{ translation: "przetłumaczone" }],
          isCorrect: true,
        },
      });
    });

    // Button returns to enabled state
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
