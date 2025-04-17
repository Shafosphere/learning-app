import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ScrambledText from '../arena/ScrambledText';

describe('ScrambledText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('wyświetla początkowy tekst bez animacji', () => {
    render(<ScrambledText text="Hello" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('animuje zmianę tekstu z losowymi znakami', () => {
    const { rerender } = render(<ScrambledText text="Hi" />);
    rerender(<ScrambledText text="Bye" />);

    // Pierwszy krok animacji (30ms)
    act(() => vi.advanceTimersByTime(30));
    // Dla "Bye" (length=3): currentLength = round(2 + (3-2)* (30/1500)) = round(2.02) = 2
    expect(screen.getByTestId('scrambled-text').textContent).toBe('AA');

    // Środek animacji (750ms)
    act(() => vi.advanceTimersByTime(720));
    // W tym momencie currentLength powinno wynosić 3, a wynik powinien być trójznakowy
    expect(screen.getByTestId('scrambled-text').textContent).toMatch(/^[A-Z0-9]{3}$/);

    // Koniec animacji (1500ms)
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByTestId('scrambled-text').textContent).toBe('Bye');
  });

  it('czyści interwał przy odmontowaniu (gdy animacja została uruchomiona)', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { rerender, unmount } = render(<ScrambledText text="Test" />);
    
    // Zmiana tekstu, aby uruchomić animację
    rerender(<ScrambledText text="Test Changed" />);
    
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('przerywa istniejącą animację przy nowej zmianie tekstu', () => {
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    const { rerender } = render(<ScrambledText text="First" />);
    
    rerender(<ScrambledText text="Second" />);
    rerender(<ScrambledText text="Third" />);
    
    // Oczekujemy, że clearInterval zostanie wywołany raz (przy zmianie "Second" -> "Third")
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it('obsługuje pusty tekst', () => {
    render(<ScrambledText text="" />);
    expect(screen.getByTestId('scrambled-text')).toHaveTextContent('');
  });

  it('poprawnie interpoluje różne długości tekstu', () => {
    const { rerender } = render(<ScrambledText text="Short" />);
    
    // Zmiana tekstu z "Short" (długość 5) na "Longer text" (długość 11)
    rerender(<ScrambledText text="Longer text" />);
    // Aby currentLength przekroczyło 5, odpalamy na 150ms
    act(() => vi.advanceTimersByTime(150));
    
    const scrambled = screen.getByTestId('scrambled-text').textContent;
    expect(scrambled).toMatch(/^[A-Z0-9]+$/);
    expect(scrambled.length).toBeGreaterThan(5);
  });
});
