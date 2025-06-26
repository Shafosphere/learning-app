// src/components/__tests__/Confetti.test.jsx

import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect, beforeAll, afterAll } from "vitest";
import { act } from "react-dom/test-utils";
import Confetti from "../confetti/confetti";

describe("Confetti Component", () => {
  const TOTAL = 20;

  beforeAll(() => {
    // Switch to fake timers to control setInterval
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it("does not render any confetti when generateConfetti is false", () => {
    const { container } = render(<Confetti generateConfetti={false} />);
    // Even after some time passes, no confetti appears
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(container.querySelectorAll(".confetti")).toHaveLength(0);
  });

  it("adds a batch of confetti every 300ms when generateConfetti is true", () => {
    const { container } = render(<Confetti generateConfetti={true} />);
    // Initially, no confetti
    expect(container.querySelectorAll(".confetti")).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    // After the first interval, there are TOTAL elements
    expect(container.querySelectorAll(".confetti")).toHaveLength(TOTAL);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    // After the second interval, another batch appears
    expect(container.querySelectorAll(".confetti")).toHaveLength(TOTAL * 2);
  });

  it("stops generating confetti when generateConfetti changes to false", () => {
    const { container, rerender } = render(
      <Confetti generateConfetti={true} />
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelectorAll(".confetti")).toHaveLength(TOTAL);

    // Turn off generation
    rerender(<Confetti generateConfetti={false} />);

    act(() => {
      // Even after another 600ms, no new confetti appears
      vi.advanceTimersByTime(600);
    });
    expect(container.querySelectorAll(".confetti")).toHaveLength(TOTAL);
  });
});
