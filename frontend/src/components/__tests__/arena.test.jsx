// src/components/__tests__/arena.test.jsx

import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Testowany komponent
import ArenaContent from '../arena/arena';

// Mockowane moduły
import api from '../../utils/api';
import { useWindowWidth } from '../../hooks/window_width/windowWidth';

// 1) Mock do zapytań API
vi.mock('../../utils/api');

// 2) Mock hooka szerokości okna
vi.mock('../../hooks/window_width/windowWidth', () => ({
  useWindowWidth: vi.fn(),
}));

// 3) Mock ScrambledText – brak animacji, od razu wyświetla otrzymany tekst
vi.mock('../arena/ScrambledText', () => ({
  default: ({ text }) => <span>{text}</span>,
}));

// 4) Mock wykresu
vi.mock('../arena/chart', () => ({
  default: () => <div data-testid="chart" />,
}));

// Funkcja pomocnicza do ustawiania szerokości okna
const mockWindowWidth = (width) => {
  useWindowWidth.mockReturnValue(width);
};

describe('ArenaContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowWidth(1024);

    // Domyślne GET-y
    api.get.mockImplementation((url) => {
      if (url === '/word/history') {
        return Promise.resolve({ data: [10, 20, 30] });
      }
      if (url === '/word/random-words?count=10') {
        return Promise.resolve({
          data: Array(10).fill({ content: 'test' }),
        });
      }
      if (url === '/word/ranking-word') {
        return Promise.resolve({
          data: [1, 'test', 'pl'], // [wordId, "test", lang]
        });
      }
      return Promise.resolve({ data: [] });
    });

    // Domyślny POST (szybkie rozwiązywanie)
    api.post.mockResolvedValue({
      data: {
        success: true,
        newPoints: 40,
        correctTranslations: [{ translation: 'przetłumaczone' }],
        isCorrect: true,
      },
    });
  });

  it('powinien pobierać dane początkowe', async () => {
    render(<ArenaContent />);
    
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/word/history');
      expect(api.get).toHaveBeenCalledWith('/word/random-words?count=10');
      expect(api.get).toHaveBeenCalledWith('/word/ranking-word');
    });
  });

  it('powinien obsługiwać poprawne przesłanie odpowiedzi', async () => {
    render(<ArenaContent />);
    
    // Czekamy aż input się pojawi
    await waitFor(() => screen.getByRole('textbox'));
    
    const input = screen.getByRole('textbox');
    const button = screen.getByRole('button', { name: /confirm/i });
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(button);
    });
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/word/submit-answer', {
        wordId: 1,
        userAnswer: 'test',
        lang: 'en',
        startTime: expect.any(Number),
      });
    });
    
    expect(screen.getByText('przetłumaczone')).toBeInTheDocument();
    
    const points = await screen.findByText('40', {}, { timeout: 2000 });
    expect(points).toBeInTheDocument();
  });
  
  it('powinien aktualizować animacje kart', async () => {
    render(<ArenaContent />);
    
    await waitFor(() => screen.getByRole('textbox'));
    
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    
    await waitFor(() => {
      const cards = screen.getAllByText(/test|przetłumaczone/);
      expect(cards.length).toBeGreaterThan(5);
    });
  });
  
  it('powinien dostosowywać animacje dla małych ekranów', async () => {
    mockWindowWidth(500);
    render(<ArenaContent />);
    
    await waitFor(() => screen.getByRole('textbox'));
    
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    
    const cards = screen.getAllByText(/test/);
    expect(cards[0]).toHaveStyle('transform: translateY(0rem) rotate(0deg)');
  });
  
  it('powinien obsługiwać błędy API', async () => {
    api.post.mockRejectedValue(new Error('API error'));
    console.error = vi.fn();
    
    render(<ArenaContent />);
    
    await waitFor(() => screen.getByRole('textbox'));
    
    const input = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.keyDown(input, { key: 'Enter' });
    });
    
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  it('powinien wyświetlać odpowiednie flagi', async () => {
    render(<ArenaContent />);
    
    await waitFor(() => {
      expect(screen.getByAltText('english')).toBeInTheDocument();
    });
    
    api.get.mockImplementationOnce(() =>
      Promise.resolve({ data: [1, 'test', 'en'] })
    );
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    });
    
    await waitFor(() => {
      expect(screen.getByAltText('polish')).toBeInTheDocument();
    });
  });
  
  // ==================== TEST BLOKOWANIA PRZYCISKU ====================
  
  it('powinien blokować przycisk podczas ładowania', async () => {
    // Upewnij się, że dane są pobrane (np. flaga "english" jest widoczna)
    render(<ArenaContent />);
    await waitFor(() => expect(screen.getByAltText('english')).toBeInTheDocument());
    
    // Ręcznie sterowana obietnica dla POST
    let resolvePost;
    api.post.mockImplementation(() =>
      new Promise((resolve) => {
        resolvePost = resolve;
      })
    );
    
    const button = screen.getByRole('button', { name: /confirm/i });
    expect(button).not.toBeDisabled();
    
    await act(async () => {
      fireEvent.click(button);
      // Pauza, aby React zdążył zrenderować isLoading=true
      await new Promise((r) => setTimeout(r, 50));
    });
    
    // Czekamy, aż przycisk stanie się disabled
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    
    act(() => {
      resolvePost({
        data: {
          success: true,
          newPoints: 40,
          correctTranslations: [{ translation: 'przetłumaczone' }],
          isCorrect: true,
        },
      });
    });
    
    // Po rozwiązaniu obietnicy, przycisk powinien wrócić do stanu enabled
    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });
});
