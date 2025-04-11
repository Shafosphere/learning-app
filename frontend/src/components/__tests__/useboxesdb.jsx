import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
// Najważniejsze: mockowanie pliku z api
vi.mock('../../utils/api', () => ({
  // Jeśli w utils/api.js jest `export default axiosInstance`,
  // wystarczy obiekt z kluczem `default` w którym mamy `post: vi.fn()`.
  default: {
    post: vi.fn()
  }
}));

import { SettingsContext } from '../../pages/settings/properties';
import api from '../../utils/api';
import useBoxesDB from '../../hooks/boxes/useBoxesDB';
import 'fake-indexeddb/auto';

const mockSettings = { isLoggedIn: false };

const wrapper = ({ children }) => (
  <SettingsContext.Provider value={mockSettings}>
    {children}
  </SettingsContext.Provider>
);

describe('useBoxesDB', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('SavedBoxes');
    vi.clearAllMocks(); 
    localStorage.clear();
  });

  it('should initialize with empty boxes', async () => {
    const { result } = renderHook(
      () => useBoxesDB('B2', 1, 1, vi.fn(), vi.fn(), vi.fn()),
      { wrapper }
    );

    await act(async () => {
      // krótka pauza, by hook zdążył się wykonać
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.boxes).toEqual({
      boxOne: [],
      boxTwo: [],
      boxThree: [],
      boxFour: [],
      boxFive: [],
    });
  });

  it('should load data from IndexedDB', async () => {
    // Setup initial data
    const db = await new Promise((resolve) => {
      const request = indexedDB.open('SavedBoxes', 2);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('boxesB2', { keyPath: 'id' });
      };
      request.onsuccess = () => resolve(request.result);
    });

    await new Promise((resolve) => {
      const transaction = db.transaction('boxesB2', 'readwrite');
      const store = transaction.objectStore('boxesB2');
      store.put({ id: 1, word: 'test', boxName: 'boxOne' });
      transaction.oncomplete = resolve;
    });

    const { result } = renderHook(
      () => useBoxesDB('B2', 1, 1, vi.fn(), vi.fn(), vi.fn()),
      { wrapper }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    expect(result.current.boxes.boxOne).toHaveLength(1);
  });

  it('should handle server autoload when logged in', async () => {
    // Kluczowe: najpierw ustawiamy mock dla `api.post`
    // (po mockowaniu pliku powyżej mamy do niego dostęp):
    mockSettings.isLoggedIn = true;
    api.post.mockResolvedValue({
      data: {
        words: [{ id: 1, word: 'server', boxName: 'boxOne' }],
        patchNumber: 2
      }
    });

    const { result } = renderHook(
      () => useBoxesDB('B2', 1, 1, vi.fn(), vi.fn(), vi.fn()),
      { wrapper }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    expect(api.post).toHaveBeenCalledWith('/user/auto-load', {
      level: 'B2',
      deviceId: null
    });
    expect(result.current.boxes.boxOne).toHaveLength(1);
  });

  // i podobnie w reszcie testów...
  it('should handle save conflict resolution', async () => {
    mockSettings.isLoggedIn = true;
    localStorage.setItem('guestTimestamp_B2', Date.now());
    api.post.mockResolvedValue({
      data: { last_saved: new Date(2020, 0, 1), words: [] }
    });

    const mockShowConfirm = vi.fn().mockResolvedValue(true);

    renderHook(
      () => useBoxesDB('B2', 1, 1, vi.fn(), vi.fn(), mockShowConfirm),
      { wrapper }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    expect(mockShowConfirm).toHaveBeenCalled();
  });

  // ...
  it('should handle errors gracefully', async () => {
    api.post.mockRejectedValue(new Error('Server error'));
    console.error = vi.fn();

    const { result } = renderHook(
      () => useBoxesDB('B2', 1, 1, vi.fn(), vi.fn(), vi.fn()),
      { wrapper }
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    expect(console.error).toHaveBeenCalled();
    expect(result.current.boxes).toBeDefined();
  });
});