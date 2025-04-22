// src/components/__tests__/admin/WordDetail.test.jsx
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { IntlProvider } from 'react-intl';
import WordDetail from '../../admin/panel-words/word-details';
import api from '../../../utils/api';
import { PopupContext } from '../../popup/popupcontext';

// — zamiast no-op, ustawiamy `open = true` w showModal()
beforeAll(() => {
  window.HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

// --- Mocks API ---
vi.mock('../../../utils/api', () => ({
  default: {
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSetPopup = vi.fn();
const mockSetWord = vi.fn();
const mockSetLevel = vi.fn();

const mockWord = {
  translations: [
    {
      id: 1,
      language: 'EN',
      translation: 'test',
      description: 'test description',
      word_id: 123,
    },
    {
      id: 2,
      language: 'PL',
      translation: 'próba',
      description: 'opis próbny',
      word_id: 123,
    },
  ],
};

const Wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
      {children}
    </PopupContext.Provider>
  </IntlProvider>
);

describe('WordDetail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) =>
    render(
      <WordDetail
        word={mockWord}
        setWord={mockSetWord}
        level="B2"
        setLevel={mockSetLevel}
        {...props}
      />,
      { wrapper: Wrapper }
    );

  it('powinien renderować formularz z danymi słowa', () => {
    renderComponent();

    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('próba')).toBeInTheDocument();

    const select = screen.getByLabelText(/update level/i);
    expect(select.value).toBe('B2');
  });

  it('powinien aktualizować dane przy zmianie inputów', () => {
    renderComponent();

    const firstInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(firstInput, { target: { value: 'new value' } });

    expect(mockSetWord).toHaveBeenCalledWith({
      ...mockWord,
      translations: [
        { ...mockWord.translations[0], translation: 'new value' },
        mockWord.translations[1],
      ],
    });
  });

  it('powinien wyświetlać potwierdzenie przy usuwaniu', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /delete word/i }));
    expect(
      screen.getByText('Are you sure you want to delete that word?')
    ).toBeInTheDocument();
  });

  it('powinien wywołać API delete po potwierdzeniu', async () => {
    api.delete.mockResolvedValue({ data: 'Deleted successfully' });
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /delete word/i }));
    fireEvent.click(screen.getByRole('button', { name: /Yes/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/word/delete/123');
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: 'Deleted successfully',
        emotion: 'positive',
      });
    });
  });

  it('powinien aktualizować poziom trudności', () => {
    renderComponent();

    const select = screen.getByLabelText(/update level/i);
    fireEvent.change(select, { target: { value: 'C1' } });
    expect(mockSetLevel).toHaveBeenCalledWith('C1');
  });

  it('powinien obsługiwać błędy API przy patch', async () => {
    const error = { response: { data: 'Server error' } };
    api.patch.mockRejectedValue(error);
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /update changes/i }));
    fireEvent.click(screen.getByRole('button', { name: /Yes/i }));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: 'Server error',
        emotion: 'negative',
      });
    });
  });

  it('powinien wyświetlać domyślny komunikat błędu przy delete', async () => {
    api.delete.mockRejectedValue(new Error('Network error'));
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /delete word/i }));
    fireEvent.click(screen.getByRole('button', { name: /Yes/i }));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: 'An error occurred',
        emotion: 'negative',
      });
    });
  });

  it('nie powinien wywołać API przy anulowaniu', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /delete word/i }));
    fireEvent.click(screen.getByRole('button', { name: /No/i }));

    await waitFor(() => {
      expect(api.delete).not.toHaveBeenCalled();
      expect(api.patch).not.toHaveBeenCalled();
    });
  });
});
