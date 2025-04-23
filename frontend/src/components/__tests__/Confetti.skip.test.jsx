// src/components/__tests__/Confetti.test.jsx
import React from 'react';
import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';
import { act } from 'react-dom/test-utils';
import Confetti from '../confetti/confetti';

describe('Confetti Component', () => {
  const TOTAL = 20;

  beforeAll(() => {
    // przełączamy na fake timers, żeby móc przyspieszać setInterval
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('nie renderuje żadnego konfetti, gdy generateConfetti=false', () => {
    const { container } = render(<Confetti generateConfetti={false} />);
    // nawet po dłuższym czasie nic się nie pojawia
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(container.querySelectorAll('.confetti')).toHaveLength(0);
  });

  it('dorzuca porcję konfetti co 300ms, gdy generateConfetti=true', () => {
    const { container } = render(<Confetti generateConfetti={true} />);
    // początkowo jeszcze nic
    expect(container.querySelectorAll('.confetti')).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    // po pierwszym interwale TOTAL elementów
    expect(container.querySelectorAll('.confetti')).toHaveLength(TOTAL);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    // po drugim interwale – kolejna porcja
    expect(container.querySelectorAll('.confetti')).toHaveLength(TOTAL * 2);
  });

  it('przestaje generować konfetti, gdy generateConfetti zmieni się na false', () => {
    const { container, rerender } = render(<Confetti generateConfetti={true} />);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(container.querySelectorAll('.confetti')).toHaveLength(TOTAL);

    // wyłączamy generowanie
    rerender(<Confetti generateConfetti={false} />);

    act(() => {
      // nawet po kolejnych 600ms nie pojawi się nic nowego
      vi.advanceTimersByTime(600);
    });
    expect(container.querySelectorAll('.confetti')).toHaveLength(TOTAL);
  });
});
