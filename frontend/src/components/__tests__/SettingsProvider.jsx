// src/components/__tests__/SettingsProvider.test.jsx

import React, { useContext, useEffect } from 'react';
import { render, act, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SettingsProvider, SettingsContext } from '../../pages/settings/properties';
import api from '../../utils/api';
import { getAllWords } from '../../utils/indexedDB';

// Mockowanie zależności
vi.mock('../../utils/api');
vi.mock('../../utils/indexedDB', () => ({
  getAllWords: vi.fn(),
}));

// Testowy komponent, który zapisuje kontekst w zmiennej globalnej – dzięki temu mamy dostęp do funkcji.
let capturedContext = null;
const TestComponent = () => {
  const context = useContext(SettingsContext);
  useEffect(() => {
    capturedContext = context;
  }, [context]);
  return <div data-testid="context">Test</div>;
};

const getCapturedContext = () => capturedContext;

describe('SettingsProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    // Używamy fake timers, aby kontrolować wywołania timerów
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with default values', () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    const ctx = getCapturedContext();
    expect(ctx.themeMode).toBe('light');
    expect(ctx.isLoggedIn).toBe(false);
    expect(ctx.language).toBe('en');
  });

  it('should toggle theme correctly', async () => {
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    let ctx = getCapturedContext();
    await act(() => {
      // Wywołanie funkcji toggleTheme dostępnej w kontekście
      ctx.toggleTheme();
      return Promise.resolve();
    });
    ctx = getCapturedContext();
    expect(ctx.themeMode).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(document.body.className).toBe('dark');
  });

  it('should handle authentication check successfully', async () => {
    // Aby nie uruchamiać interwału nieskończenie, możemy zablokować wywołania setInterval w tym teście.
    const intervalSpy = vi.spyOn(window, 'setInterval').mockImplementation(() => 0);
    api.get.mockResolvedValue({
      data: { loggedIn: true, user: { name: 'test' }, expiresIn: 1000 },
    });
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    // Czekamy na działanie useEffect (checkAuthStatus)
    await act(async () => {
      vi.runAllTimers();
    });
    const ctx = getCapturedContext();
    expect(ctx.isLoggedIn).toBe(true);
    expect(ctx.user.name).toBe('test');
    intervalSpy.mockRestore();
  });

  it('should handle token expiration', async () => {
    const intervalSpy = vi.spyOn(window, 'setInterval').mockImplementation(() => 0);
    localStorage.setItem('token_expires', (Date.now() - 1000).toString());
    api.get.mockRejectedValue(new Error('Token expired'));
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await act(async () => {
      // Dla testu token expiration wystarczy przesunąć czas o 30 sekund
      vi.advanceTimersByTime(30000);
      vi.runAllTimers();
    });
    const ctx = getCapturedContext();
    expect(ctx.isLoggedIn).toBe(false);
    expect(localStorage.getItem('token_expires')).toBeNull();
    intervalSpy.mockRestore();
  });

  it('should reset daily progress correctly', async () => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    // Ustawiamy w localStorage datę wczorajszą i przykładowe wartości procentów
    localStorage.setItem('lastResetDate', JSON.stringify(yesterday));
    localStorage.setItem('ProcentB2MainGame', '50');
    localStorage.setItem('ProcentC1MainGame', '30');
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    // Zamiast uruchamiać wszystkie timery – wystarczy poczekać jeden tick,
    // aby efekty (useEffect) zareagowały na zmianę stanu.
    await act(async () => {
      await Promise.resolve();
    });
    const ctx = getCapturedContext();
    expect(ctx.procentB2).toBe(0);
    expect(ctx.procentC1).toBe(0);
    expect(ctx.lastResetDate).toBe(today);
  });

  it('should calculate percentages correctly', async () => {
    // Przygotowujemy mocki: funkcja getAllWords zwraca 2 elementy,
    // a API zwraca 100 słówek dla B2 i 50 dla C1.
    getAllWords.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    api.get.mockResolvedValue({ data: { numberWordsB2: 100, numberWordsC1: 50 } });
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await act(async () => {
      const ctx = getCapturedContext();
      await ctx.calculatePercent('B2');
      await ctx.calculateTotalPercent('B2');
    });
    const ctx = getCapturedContext();
    // Zakładamy, że dailyGoal domyślnie to 20:
    // calculatePercent: (2 * 100) / 20 = 10
    expect(ctx.procentB2).toBe(10);
    // totalPercentB2: (2/100)*100 = 2
    expect(ctx.totalPercentB2).toBe(2);
  });

  it('should handle logout correctly', async () => {
    // UWAGA:
    // Aby ten test przeszedł, w SettingsProvider musisz dodać funkcję handleLogoutLogic
    // do wartości przekazywanej przez kontekst. Na przykład:
    // <SettingsContext.Provider value={{ ..., handleLogoutLogic, ... }}>
    localStorage.setItem('guestTimestamp_B2', '123');
    localStorage.setItem('token', 'test');
    render(
      <SettingsProvider>
        <TestComponent />
      </SettingsProvider>
    );
    await act(async () => {
      const ctx = getCapturedContext();
      // Zakładamy, że handleLogoutLogic jest dostępna w kontekście
      if (typeof ctx.handleLogoutLogic === 'function') {
        ctx.handleLogoutLogic();
      }
      return Promise.resolve();
    });
    const ctx = getCapturedContext();
    expect(ctx.isLoggedIn).toBe(false);
    expect(ctx.user).toBeNull();
    expect(localStorage.getItem('guestTimestamp_B2')).toBeNull();
  });
});
