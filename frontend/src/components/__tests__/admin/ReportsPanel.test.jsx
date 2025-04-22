// src/components/__tests__/admin/ReportsPanel.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../../../utils/api';
import ReportsPanel from '../../admin/panel-reports/panel-reports';

// Mock api
vi.mock('../../../utils/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Podmieniamy ReportDetails na prosty stub, żeby łatwo sprawdzać propsy
vi.mock('../../admin/panel-reports/report-details', () => ({
  __esModule: true,
  default: ({ reportID, reloadData }) => (
    <div data-testid="report-details">
      reportID: {reportID}, reloadData: {typeof reloadData}
    </div>
  ),
}));

describe('ReportsPanel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays reports sorted ascending by type', async () => {
    const fakeData = [
      { id: 1, type: 'B', desc: 'descB', time: '2020-01-02T10:20:30Z' },
      { id: 2, type: 'A', desc: 'descA', time: '2020-01-01T00:00:00Z' },
    ];
    api.get.mockResolvedValue({ data: fakeData });

    const { container } = render(<ReportsPanel />);

    // czekamy na fetch
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/report/data')
    );

    const rows = container.querySelectorAll('tbody tr');
    expect(rows).toHaveLength(2);

    // Pierwszy wiersz powinien być typ "A" (ascending)
    expect(rows[0]).toHaveTextContent('A');
    expect(rows[0]).toHaveTextContent('descA');
    expect(rows[0]).toHaveTextContent('01-01-2020');

    // Drugi wiersz typ "B"
    expect(rows[1]).toHaveTextContent('B');
    expect(rows[1]).toHaveTextContent('descB');
    expect(rows[1]).toHaveTextContent('02-01-2020');
  });

  it('sorts reports descending by type when TYPE header clicked', async () => {
    const fakeData = [
      { id: 1, type: 'B', desc: 'descB', time: '2020-01-02T10:20:30Z' },
      { id: 2, type: 'A', desc: 'descA', time: '2020-01-01T00:00:00Z' },
    ];
    api.get.mockResolvedValue({ data: fakeData });

    const { container } = render(<ReportsPanel />);
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/report/data')
    );

    // klik na nagłówek TYPE – zmienia kierunek sortowania na descending
    fireEvent.click(screen.getByText('TYPE'));

    const rows = container.querySelectorAll('tbody tr');
    // Teraz najpierw B, potem A
    expect(rows[0]).toHaveTextContent('B');
    expect(rows[1]).toHaveTextContent('A');
  });

  it('updates reportID when a row is clicked and passes it to ReportDetails', async () => {
    const fakeData = [
      { id: 3, type: 'X', desc: 'descX', time: '2021-05-05T05:05:05Z' },
    ];
    api.get.mockResolvedValue({ data: fakeData });

    render(<ReportsPanel />);
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/report/data')
    );

    // Klikamy w wiersz z typem "X"
    fireEvent.click(screen.getByText('X'));

    const details = screen.getByTestId('report-details');
    expect(details).toHaveTextContent('reportID: 3');
    expect(details).toHaveTextContent('reloadData: function');
  });
});
