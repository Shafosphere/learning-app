import { renderHook } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import useSpellchecking from '../../hooks/spellchecking/spellchecking';
import { PopupContext } from '../popup/popupcontext';
import { SettingsContext } from '../../pages/settings/properties';

// Mockowanie kontekstów
const mockSettings = {
  diacritical: false,
  spellChecking: false,
};

const mockPopup = {
  setPopup: vi.fn(),
};

const wrapper = ({ children }) => (
  <SettingsContext.Provider value={mockSettings}>
    <PopupContext.Provider value={mockPopup}>
      {children}
    </PopupContext.Provider>
  </SettingsContext.Provider>
);

describe('useSpellchecking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings.diacritical = false;
    mockSettings.spellChecking = false;
  });

  describe('Normalizacja tekstu', () => {
    it('powinna usunąć polskie znaki diakrytyczne gdy diacritical=false', () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('łąka', 'laka')).toBe(true);
      expect(result.current('śćżźń', 'sczzn')).toBe(true);
    });

    it('nie powinna zmieniać znaków gdy diacritical=true', () => {
      mockSettings.diacritical = true;
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('łąka', 'łąka')).toBe(true);
      expect(result.current('łąka', 'laka')).toBe(false);
    });
  });

  describe('Walidacja pustych inputów', () => {
    it('powinna zwrócić false i pokazać popup dla pustej odpowiedzi użytkownika', () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('', 'test')).toBe(false);
      expect(mockPopup.setPopup).toHaveBeenCalledWith({
        message: "Chyba nic nie wpisałeś?",
        emotion: "warning",
      });
    });

    it('powinna zwrócić false i pokazać popup dla brakującej poprawnej odpowiedzi', () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('test', '')).toBe(false);
      expect(mockPopup.setPopup).toHaveBeenCalledWith({
        message: "Niepoprawnie załadowane słówko",
        emotion: "warning",
      });
    });
  });

  describe('Tryb ścisły (spellChecking=false)', () => {
    it('powinna zwracać true tylko dla dokładnych dopasowań', () => {
      mockSettings.spellChecking = false;
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('test', 'test')).toBe(true);
      expect(result.current('Test', 'test')).toBe(true); // case insensitive
      expect(result.current('tes', 'test')).toBe(false);
      expect(result.current('test ', 'test')).toBe(true); // trim
    });
  });

  describe('Tryb tolerancyjny (spellChecking=true)', () => {
    beforeEach(() => {
      mockSettings.spellChecking = true;
    });

    it('powinna akceptować 1 błąd', () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('test', 'test')).toBe(true); // 0 błędów
      expect(result.current('tast', 'test')).toBe(true); // 1 błąd
      expect(result.current('tbst', 'test')).toBe(true); // 1 błąd
      expect(result.current('tes', 'test')).toBe(true); // różna długość
      expect(result.current('txx', 'test')).toBe(false); // 2 błędy
    });

    it('powinna liczyć różnice w różnych długościach', () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('telefon', 'telefony')).toBe(true); // +1 znak
      expect(result.current('telegony', 'telefony')).toBe(true);
    });
  });

  describe('Obsługa białych znaków', () => {
    it('powinna trimować białe znaki', () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('  test  ', 'test')).toBe(true);
      expect(result.current('\ttest\n', 'test')).toBe(true);
    });
  });

  describe('Case sensitivity', () => {
    it('powinna ignorować wielkość liter', () => {
      const { result } = renderHook(() => useSpellchecking(), { wrapper });
      
      expect(result.current('TEST', 'test')).toBe(true);
      expect(result.current('Test', 'tESt')).toBe(true);
    });
  });
});