// src/components/__tests__/admin/AddWord.test.jsx
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { IntlProvider } from 'react-intl';
import AddWord from '../../admin/panel-words/word-add';
import api from '../../../utils/api';
import { PopupContext } from '../../popup/popupcontext';

// — polyfill dla <dialog> w JSDOM — 
beforeAll(() => {
  if (window.HTMLDialogElement) {
    window.HTMLDialogElement.prototype.showModal =
      window.HTMLDialogElement.prototype.showModal ||
      function () {
        this.setAttribute('open', '');
      };
    window.HTMLDialogElement.prototype.close =
      window.HTMLDialogElement.prototype.close ||
      function () {
        this.removeAttribute('open');
      };
  }
});

// — mock API —
vi.mock('../../../utils/api', () => ({
  default: {
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

describe('AddWord Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.post.mockReset();
  });

  const renderComponent = () =>
    render(<AddWord />, { wrapper: Wrapper });

  it('powinien renderować formularz z polami dla dwóch języków', () => {
    renderComponent();

    expect(screen.getAllByRole('textbox')).toHaveLength(4);
    expect(screen.getByLabelText('Choose level')).toBeInTheDocument();
    expect(screen.getByDisplayValue('B2')).toBeInTheDocument();
  });

  it('powinien aktualizować stan przy zmianie inputów', () => {
    renderComponent();

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'test' } });
    fireEvent.change(inputs[2], { target: { value: 'opis' } });

    expect(inputs[0].value).toBe('test');
    expect(inputs[2].value).toBe('opis');
  });

  it('powinien zmieniać poziom trudności', () => {
    renderComponent();

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'C1' } });

    expect(select.value).toBe('C1');
  });

  it('powinien wyświetlać potwierdzenie przed wysłaniem', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(
      screen.getByText('Are you sure you want to update your data?')
    ).toBeInTheDocument();
  });

  it('powinien wysłać dane po potwierdzeniu', async () => {
    const mockData = {
      translations: [
        { language: 'en', translation: 'test', description: 'desc' },
        { language: 'pl', translation: 'próba', description: 'opis' },
      ],
      level: 'B2',
    };
    api.post.mockResolvedValue({ data: 'Word added' });

    renderComponent();

    // wypełniamy formularz
    const [inEn, descEn, inPl, descPl] = screen.getAllByRole('textbox');
    fireEvent.change(inEn, { target: { value: 'test' } });
    fireEvent.change(descEn, { target: { value: 'desc' } });
    fireEvent.change(inPl, { target: { value: 'próba' } });
    fireEvent.change(descPl, { target: { value: 'opis' } });

    // Confirm → Yes
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/word/add', mockData);
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: 'Word added',
        emotion: 'positive',
      });
    });
  });

  it('powinien obsługiwać błędy API', async () => {
    const error = { response: { data: 'Validation error' } };
    api.post.mockRejectedValue(error);

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

    await waitFor(() => {
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: 'Validation error',
        emotion: 'negative',
      });
    });
  });

  it('powinien focusować select po kliknięciu kontenera', () => {
    renderComponent();

    const select = screen.getByRole('combobox');
    const container = screen.getByText('Choose level').closest('div');

    fireEvent.click(container);
    expect(document.activeElement).toBe(select);
  });

  it('nie powinien wysłać danych po anulowaniu', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    fireEvent.click(screen.getByRole('button', { name: 'No' }));

    await waitFor(() => {
      expect(api.post).not.toHaveBeenCalled();
    });
  });
});
