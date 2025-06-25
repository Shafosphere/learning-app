// src/components/__tests__/admin/UsersPanel.test.jsx
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
import UsersPanel from '../../admin/panel-users/panel-users';
import { PopupContext } from '../../popup/popupcontext';

// stub dla scrollIntoView
const scrollMock = vi.fn();

beforeAll(() => {
  // polyfill <dialog>
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
  // stub scrollIntoView
  HTMLElement.prototype.scrollIntoView = scrollMock;
});

// mock api
vi.mock('../../../utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockSetPopup = vi.fn();

const Wrapper = ({ children }) => (
  <IntlProvider locale="en" messages={{}}>
    <PopupContext.Provider value={{ setPopup: mockSetPopup }}>
      {children}
    </PopupContext.Provider>
  </IntlProvider>
);

describe('UsersPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockReset();
    api.delete.mockReset();
    scrollMock.mockReset();
  });

  it('loads and displays initial users', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/user/list?page=1&limit=50') {
        return Promise.resolve({
          data: [
            { id: 1, username: 'alice', email: 'a@e', created_at:'', last_login:'', ban:false, role:'user' },
            { id: 2, username: 'bob',   email: 'b@e', created_at:'', last_login:'', ban:true,  role:'admin' },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<UsersPanel />, { wrapper: Wrapper });

    // czekamy na fetch listy
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/user/list?page=1&limit=50')
    );

    // obaj użytkownicy w tabeli
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('searches and scrolls to a user when clicking a result', async () => {
    // najpierw mock listy z charlie, żeby scrollIntoView miał co znaleźć
    api.get.mockImplementation((url) => {
      if (url === '/user/list?page=1&limit=50') {
        return Promise.resolve({
          data: [
            { id: 42, username: 'charlie', email: 'c@e', created_at:'', last_login:'', ban:false, role:'user' },
          ],
        });
      }
      if (url === '/user/search?query=char') {
        return Promise.resolve({
          data: [{ id: 42, username: 'charlie', email: 'c@e' }],
        });
      }
      return Promise.resolve({ data: [] });
    });

    render(<UsersPanel />, { wrapper: Wrapper });

    // początkowy fetch
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/user/list?page=1&limit=50')
    );

    // wpisujemy "char" w wyszukiwarce
    fireEvent.change(
      screen.getByPlaceholderText('Search by ID, username, or email'),
      { target: { value: 'char' } }
    );

    // i czekamy na search API
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/user/search?query=char')
    );

    // teraz w DOM jest lista wyników
    const resultsList = screen.getByRole('list');
    const resultItem = within(resultsList).getByText('charlie');
    expect(resultItem).toBeInTheDocument();

    // klikamy wynik i scrollIntoView powinien być wywołany
    fireEvent.click(resultItem);
    await waitFor(() => expect(scrollMock).toHaveBeenCalled());
  });

  it('shows confirm dialog and deletes user on confirmation', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 5, username: 'dan', email: 'd@e', created_at:'', last_login:'', ban:false, role:'user' },
      ],
    });
    api.delete.mockResolvedValue({ status: 200 });

    const { container } = render(<UsersPanel />, { wrapper: Wrapper });

    await waitFor(() => expect(api.get).toHaveBeenCalled());

    // znajdź ikonę usuwania i kliknij
    const iconsCell = container.querySelector('.actions-cell');
    const svgIcons = iconsCell.querySelectorAll('svg');
    fireEvent.click(svgIcons[1]);

    // potwierdzenie
    expect(
      screen.getByText('Are you sure you want to delete this user?')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Yes/i }));

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/user/delete/5');
      expect(screen.queryByText('dan')).not.toBeInTheDocument();
      expect(mockSetPopup).toHaveBeenCalledWith({
        message: 'User deleted successfully.',
        emotion: 'positive',
      });
    });
  });
});
