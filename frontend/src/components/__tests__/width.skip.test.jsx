import { vi, describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useWindowWidth } from "../../hooks/window_width/windowWidth";

describe("useWindowWidth", () => {
  beforeEach(() => {
    // Resetuj wszystkie mocki przed każdym testem
    vi.restoreAllMocks();
    
    // Ustaw początkową szerokość okna
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  it("powinien zwrócić aktualną szerokość okna", () => {
    const { result } = renderHook(() => useWindowWidth());
    expect(result.current).toBe(1024);
  });

  it("powinien aktualizować szerokość przy zmianie rozmiaru okna", () => {
    const { result } = renderHook(() => useWindowWidth());
    
    // Opakowanie zmiany rozmiaru w act
    act(() => {
      window.innerWidth = 768;
      window.dispatchEvent(new Event("resize"));
    });
    
    expect(result.current).toBe(768);
  });

  it("powinien usunąć listener przy unmouncie", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    
    const { unmount } = renderHook(() => useWindowWidth());
    
    // Pobierz zarejestrowany handler
    const handler = addSpy.mock.calls.find(
      (call) => call[0] === "resize"
    )[1];
    
    unmount();
    
    expect(removeSpy).toHaveBeenCalledWith("resize", handler);
  });

  it("powinien obsługiwać kolejne zmiany rozmiaru", () => {
    const { result } = renderHook(() => useWindowWidth());
    
    // Pierwsza zmiana
    act(() => {
      window.innerWidth = 800;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(800);
    
    // Druga zmiana
    act(() => {
      window.innerWidth = 600;
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(600);
  });

  it("powinien ignorować zmiany po unmouncie", () => {
    const { result, unmount } = renderHook(() => useWindowWidth());
    
    unmount();
    
    act(() => {
      window.innerWidth = 900;
      window.dispatchEvent(new Event("resize"));
    });
    
    // Stan nie powinien się zmienić po unmouncie
    expect(result.current).toBe(1024);
  });
});
