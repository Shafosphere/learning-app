import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import usePatch from '../../hooks/boxes/usePatch';
import api from '../../utils/api';

// Mockowanie modułów
vi.mock('../../utils/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('usePatch', () => {
  const mockDependencies = {
    lvl: 'B2',
    patchNumberB2: 1,
    patchNumberC1: 1,
    totalB2Patches: 5,
    totalC1Patches: 5,
    setPopup: vi.fn(),
    setBoxes: vi.fn(),
    setAutoSave: vi.fn(),
    setB2Patch: vi.fn(),
    setC1Patch: vi.fn(),
    activeBox: 'boxOne',
    selectRandomWord: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should fetch next patch successfully for B2', async () => {
    const mockResponse = {
      data: {
        data: [{ id: 1, word: 'test' }],
      },
    };
    api.post.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => usePatch(mockDependencies));

    await act(async () => {
      await result.current.getNextPatch();
    });

    expect(api.post).toHaveBeenCalledWith('/word/patch-data', {
      level: 'B2',
      patchNumber: 1,
    });
    expect(mockDependencies.setBoxes).toHaveBeenCalled();
    expect(mockDependencies.setB2Patch).toHaveBeenCalledWith(2);
    expect(localStorage.getItem('currentB2Patch-voca')).toBe('2');
  });

  it('should handle C1 level correctly', async () => {
    const customDeps = { ...mockDependencies, lvl: 'C1' };
    api.post.mockResolvedValue({ data: { data: [] } });

    const { result } = renderHook(() => usePatch(customDeps));

    await act(async () => {
      await result.current.getNextPatch();
    });

    expect(api.post).toHaveBeenCalledWith('/word/patch-data', {
      level: 'C1',
      patchNumber: 1,
    });
    expect(mockDependencies.setC1Patch).toHaveBeenCalledWith(2);
    expect(localStorage.getItem('currentC1Patch-voca')).toBe('2');
  });

  it('should show popup when all patches are fetched', async () => {
    const customDeps = { 
      ...mockDependencies,
      patchNumberB2: 6,
      totalB2Patches: 5,
    };

    const { result } = renderHook(() => usePatch(customDeps));

    await act(async () => {
      await result.current.getNextPatch();
    });

    expect(mockDependencies.setPopup).toHaveBeenCalledWith({
      message: 'Pobrales wszystkie słowa z tego poziomu!',
      emotion: 'positive',
    });
    expect(api.post).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const error = new Error('API error');
    api.post.mockRejectedValue(error);
    console.error = vi.fn();

    const { result } = renderHook(() => usePatch(mockDependencies));

    await act(async () => {
      await result.current.getNextPatch();
    });

    expect(console.error).toHaveBeenCalledWith('Error fetching next patch:', error);
    expect(mockDependencies.setBoxes).not.toHaveBeenCalled();
  });

  it('should update boxOne random word selection', async () => {
    api.post.mockResolvedValue({ data: { data: [] } });

    const { result } = renderHook(() => usePatch(mockDependencies));

    await act(async () => {
      await result.current.getNextPatch();
    });

    expect(mockDependencies.selectRandomWord).toHaveBeenCalledWith('boxOne');
  });

  it('should handle different active box', async () => {
    const customDeps = { ...mockDependencies, activeBox: 'boxTwo' };
    api.post.mockResolvedValue({ data: { data: [] } });

    const { result } = renderHook(() => usePatch(customDeps));

    await act(async () => {
      await result.current.getNextPatch();
    });

    expect(mockDependencies.selectRandomWord).not.toHaveBeenCalled();
  });

  it('should handle empty response data', async () => {
    api.post.mockResolvedValue({ data: {} });

    const { result } = renderHook(() => usePatch(mockDependencies));

    await act(async () => {
      await result.current.getNextPatch();
    });

    expect(mockDependencies.setBoxes).not.toHaveBeenCalled();
  });
});