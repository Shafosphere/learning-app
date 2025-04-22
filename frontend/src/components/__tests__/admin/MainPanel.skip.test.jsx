// src/components/__tests__/admin/MainPanel.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '../../../utils/api';
import MainPanel from '../../admin/panel-data/panel-main';

// — stubujemy Block, ConfirmWindow, PinWindow, MyButton, VisitChart i UserChart —
vi.mock('../../admin/panel-data/block', () => ({
  __esModule: true,
  default: ({ number, title }) => (
    <div data-testid="block">{title}:{number}</div>
  ),
}));

vi.mock('../../confirm/confirm', () => ({
  __esModule: true,
  default: ({ message, onClose }) => (
    <div data-testid="confirm-window">{message}</div>
  ),
}));

vi.mock('../../pin/pin', () => ({
  __esModule: true,
  default: ({ onClose }) => <div data-testid="pin-window" />,
}));

vi.mock('../../button/button', () => ({
  __esModule: true,
  default: ({ message, onClick }) => (
    <button data-testid="my-button" onClick={onClick}>
      {message}
    </button>
  ),
}));

vi.mock('../../admin/panel-data/chartvisits.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="visit-chart" />,
}));

vi.mock('../../admin/panel-data/chartusers.jsx', () => ({
  __esModule: true,
  default: () => <div data-testid="user-chart" />,
}));

// — mock api —
vi.mock('../../../utils/api', () => ({
  __esModule: true,
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('MainPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches global-data and renders Blocks and Charts', async () => {
    // Przygotowujemy fałszywe dane
    const fakeData = {
      total_users: 10,
      total_reports: 5,
      users_logged_in_today: 3,
      today_flashcard_visitors: 7,
      today_vocabulary_b2_visitors: 4,
      today_vocabulary_c1_visitors: 2,
      total_languages: 6,
      total_words: 100,
      total_b2_words: 60,
      total_c1_words: 40,
    };
    api.get.mockResolvedValue({ data: fakeData });

    render(<MainPanel />);

    // Czekamy, aż api.get zostanie wywołane
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/admin/global-data')
    );

    // Sprawdzamy, że stubbowane Bloki się renderują (powinno być ich 10)
    const blocks = screen.getAllByTestId('block');
    expect(blocks).toHaveLength(10);

    // I że wykresy też się pojawiły
    expect(screen.getByTestId('user-chart')).toBeInTheDocument();
    expect(screen.getByTestId('visit-chart')).toBeInTheDocument();
  });
});
