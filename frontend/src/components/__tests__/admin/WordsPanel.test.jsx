// src/components/__tests__/admin/WordsPanel.test.jsx
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';
import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { IntlProvider } from 'react-intl';
import api from '../../../utils/api';
import WordsPanel from '../../admin/panel-words/panel-words';
import { PopupContext } from '../../popup/popupcontext';

// — polyfill dla <dialog> w JSDOM —
beforeAll(() => {
  if (typeof window.HTMLDialogElement !== 'undefined') {
    HTMLDialogElement.prototype.showModal =
      HTMLDialogElement.prototype.showModal ||
      function () {
        this.setAttribute('open', '');
      };
    HTMLDialogElement.prototype.close =
      HTMLDialogElement.prototype.close ||
      function () {
        this.removeAttribute('open');
      };
  }
});

// — mock api —
vi.mock('../../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockSetPopup = vi.fn();

// wrapper z IntlProvider + PopupContext
const Wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
      {children}
    </PopupContext.Provider>
  </IntlProvider>
);

describe('WordsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockReset();
    api.post.mockReset();
  });

  it('loads and displays initial words', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/word/list?page=1&limit=50') {
        return Promise.resolve({
          data: [
            { id: 1, word: 'one', level: 'A1' },
            { id: 2, word: 'two', level: 'B2' },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<WordsPanel />, { wrapper: Wrapper });

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/word/list?page=1&limit=50'),
    );

    expect(screen.getByText('one')).toBeInTheDocument();
    expect(screen.getByText('two')).toBeInTheDocument();
  });

  it('toggles AddWord form when clicking "new word"', async () => {
    api.get.mockResolvedValue({ data: [] });

    render(<WordsPanel />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('new word'));

    // Znajdź formularz AddWord wewnątrz div.word-details
    const addWordForm = screen
      .getByLabelText('Choose level')
      .closest('.word-details');
    expect(addWordForm).toBeInTheDocument();

    // wewnątrz tego formularza są 4 pola tekstowe (2 inputy + 2 textarea)
    const fields = within(addWordForm).getAllByRole('textbox');
    expect(fields).toHaveLength(4);

    // i oczywiście select poziomu
    expect(within(addWordForm).getByLabelText('Choose level')).toBeInTheDocument();
  });

  it('searches and shows detail when clicking a result', async () => {
    api.get.mockImplementation((url) => {
      if (url.startsWith('/word/list')) {
        return Promise.resolve({ data: [] });
      }
      if (url.startsWith('/word/search')) {
        return Promise.resolve({
          data: [{ id: 3, word: 'three', level: 'C1' }],
        });
      }
      return Promise.resolve({ data: [] });
    });
    api.post.mockResolvedValue({
      data: {
        translations: [
          {
            id: 3,
            language: 'EN',
            translation: 'three',
            description: 'num',
            word_id: 3,
          },
        ],
      },
    });

    render(<WordsPanel />, { wrapper: Wrapper });

    fireEvent.change(
      screen.getByPlaceholderText('Search by ID or word'),
      { target: { value: 'thr' } },
    );

    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/word/search?query=thr'),
    );

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('three')).toBeInTheDocument();

    fireEvent.click(screen.getByText('three'));

    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/word/detail', { id: 3 }),
    );

    expect(screen.getByDisplayValue('three')).toBeInTheDocument();
  });
});
