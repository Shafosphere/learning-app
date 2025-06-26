import { renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import useSpellchecking from "../../hooks/spellchecking/spellchecking";
import { PopupContext } from "../popup/popupcontext";
import { SettingsContext } from "../../pages/settings/properties";

// Mocking contexts for Settings and Popup
const mockSettings = {
  diacritical: false,
  spellChecking: false,
};

const mockPopup = {
  setPopup: vi.fn(),
};

const wrapper = ({ children }) => (
  <SettingsContext.Provider value={mockSettings}>
    <PopupContext.Provider value={mockPopup}>{children}</PopupContext.Provider>
  </SettingsContext.Provider>
);

describe("useSpellchecking hook", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    mockSettings.diacritical = false;
    mockSettings.spellChecking = false;
  });

  describe("Text normalization", () => {
    it("should remove Polish diacritical marks when diacritical=false", () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("łąka", "laka")).toBe(true);
      expect(result.current("śćżźń", "sczzn")).toBe(true);
    });

    it("should not modify characters when diacritical=true", () => {
      mockSettings.diacritical = true;
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("łąka", "łąka")).toBe(true);
      expect(result.current("łąka", "laka")).toBe(false);
    });
  });

  describe("Empty input validation", () => {
    it("should return false and show popup for empty user input", () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("", "test")).toBe(false);
      expect(mockPopup.setPopup).toHaveBeenCalledWith({
        message: "You didn't enter anything.",
        emotion: "warning",
      });
    });

    it("should return false and show popup for missing correct answer", () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("test", "")).toBe(false);
      expect(mockPopup.setPopup).toHaveBeenCalledWith({
        message: "Failed to load the correct word.",
        emotion: "warning",
      });
    });
  });

  describe("Strict mode (spellChecking=false)", () => {
    it("should return true only for exact matches", () => {
      mockSettings.spellChecking = false;
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("test", "test")).toBe(true);
      expect(result.current("Test", "test")).toBe(true);
      expect(result.current("tes", "test")).toBe(false);
      expect(result.current("test ", "test")).toBe(true);
    });
  });

  describe("Tolerant mode (spellChecking=true)", () => {
    beforeEach(() => {
      mockSettings.spellChecking = true;
    });

    it("should allow one error", () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("test", "test")).toBe(true);
      expect(result.current("tast", "test")).toBe(true);
      expect(result.current("tbst", "test")).toBe(true);
      expect(result.current("tes", "test")).toBe(true);
      expect(result.current("txx", "test")).toBe(false);
    });

    it("should count differences for different lengths", () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("telefon", "telefony")).toBe(true);
      expect(result.current("telegony", "telefony")).toBe(true);
    });
  });

  describe("Whitespace handling", () => {
    it("should trim whitespace", () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("  test  ", "test")).toBe(true);
      expect(result.current("\ttest\n", "test")).toBe(true);
    });
  });

  describe("Case sensitivity", () => {
    it("should ignore letter case", () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });

      expect(result.current("TEST", "test")).toBe(true);
      expect(result.current("Test", "tESt")).toBe(true);
    });
  });
});
