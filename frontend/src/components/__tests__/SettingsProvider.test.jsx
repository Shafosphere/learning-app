// src/components/__tests__/SettingsProvider.test.jsx

import React, { useContext, useEffect } from "react";
import { render, act, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  SettingsProvider,
  SettingsContext,
} from "../../pages/settings/properties";
import api from "../../utils/api";
import { getAllWords } from "../../utils/indexedDB";

// Mocking dependencies
vi.mock("../../utils/api");
vi.mock("../../utils/indexedDB", () => ({
  getAllWords: vi.fn(),
}));

// Test component that stores the context in a global variable, so we have access to its functions.
let capturedContext = null;
const TestComponent = () => {
  const context = useContext(SettingsContext);
  useEffect(() => {
    capturedContext = context;
  }, [context]);
  return <div data-testid="context">Test</div>;
};

const getCapturedContext = () => capturedContext;

describe("SettingsProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // We use fake timers to control timer calls
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should initialize with default values", () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    const ctx = getCapturedContext();
    expect(ctx.themeMode).toBe("light");
    expect(ctx.isLoggedIn).toBe(false);
    expect(ctx.language).toBe("en");
  });

  it("should toggle theme correctly", async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    let ctx = getCapturedContext();
    await act(() => {
      // Call the toggleTheme function available in the context
      ctx.toggleTheme();
      return Promise.resolve();
    });
    ctx = getCapturedContext();
    expect(ctx.themeMode).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.body.className).toBe("dark");
  });

  it("should handle authentication check successfully", async () => {
    // To avoid running the interval indefinitely, we can mock setInterval calls in this test.
    const intervalSpy = vi
      .spyOn(window, "setInterval")
      .mockImplementation(() => 0);
    api.get.mockResolvedValue({
      data: { loggedIn: true, user: { name: "test" }, expiresIn: 1000 },
    });
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    // Wait for useEffect (checkAuthStatus) to run
    await act(async () => {
      vi.runAllTimers();
    });
    const ctx = getCapturedContext();
    expect(ctx.isLoggedIn).toBe(true);
    expect(ctx.user.name).toBe("test");
    intervalSpy.mockRestore();
  });

  it("should handle token expiration", async () => {
    const intervalSpy = vi
      .spyOn(window, "setInterval")
      .mockImplementation(() => 0);
    localStorage.setItem("token_expires", (Date.now() - 1000).toString());
    api.get.mockRejectedValue(new Error("Token expired"));
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await act(async () => {
      // For the token expiration test, it's enough to advance time by 30 seconds
      vi.advanceTimersByTime(30000);
      vi.runAllTimers();
    });
    const ctx = getCapturedContext();
    expect(ctx.isLoggedIn).toBe(false);
    expect(localStorage.getItem("token_expires")).toBeNull();
    intervalSpy.mockRestore();
  });

  it("should reset daily progress correctly", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    // We set yesterday's date and sample percentage values in localStorage
    localStorage.setItem("lastResetDate", JSON.stringify(yesterday));
    localStorage.setItem("ProcentB2MainGame", "50");
    localStorage.setItem("ProcentC1MainGame", "30");
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    // Instead of running all timers, waiting a single tick is sufficient for the effects (useEffect) to respond to state changes.
    await act(async () => {
      await Promise.resolve();
    });
    const ctx = getCapturedContext();
    expect(ctx.procentB2).toBe(0);
    expect(ctx.procentC1).toBe(0);
    expect(ctx.lastResetDate).toBe(today);
  });

  it("should calculate percentages correctly", async () => {
    // We prepare mocks: the getAllWords function returns 2 items, and the API returns 100 words for B2 and 50 for C1.
    getAllWords.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    api.get.mockResolvedValue({
      data: { numberWordsB2: 100, numberWordsC1: 50 },
    });
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await act(async () => {
      const ctx = getCapturedContext();
      await ctx.calculatePercent("B2");
      await ctx.calculateTotalPercent("B2");
    });
    const ctx = getCapturedContext();
    // We assume the dailyGoal default is 20:
    // calculatePercent: (2 * 100) / 20 = 10
    expect(ctx.procentB2).toBe(10);
    // totalPercentB2: (2/100)*100 = 2
    expect(ctx.totalPercentB2).toBe(2);
  });

  it("should handle logout correctly", async () => {
    localStorage.setItem("guestTimestamp_B2", "123");
    localStorage.setItem("token", "test");
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await act(async () => {
      const ctx = getCapturedContext();
      // We assume handleLogoutLogic is available in the context
      if (typeof ctx.handleLogoutLogic === "function") {
        ctx.handleLogoutLogic();
      }
      return Promise.resolve();
    });
    const ctx = getCapturedContext();
    expect(ctx.isLoggedIn).toBe(false);
    expect(ctx.user).toBeNull();
    expect(localStorage.getItem("guestTimestamp_B2")).toBeNull();
  });
});
