import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SelectLvl from '../selectlvl/selectlvl';

// Mock FormattedMessage do wyświetlania ID
vi.mock('react-intl', () => ({
  FormattedMessage: ({ id }) => <span data-testid="formatted-message">{id}</span>,
}));

describe('SelectLvl Component', () => {
  const mockSetDisplay = vi.fn();
  const defaultLevels = [
    { value: 'B2', messageKey: 'levelB2' },
    { value: 'C1', messageKey: 'levelC1' }
  ];

  const customLevels = [
    { value: 'A1', messageKey: 'levelA1', icon: '🎮' },
    { value: 'A2', messageKey: 'levelA2', icon: '🌟' }
  ];

  const renderComponent = (props = {}) => 
    render(
      <SelectLvl
        setDisplay={mockSetDisplay}
        gametype="default"
        {...props}
      />
    );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('powinien renderować domyślne poziomy B2 i C1', () => {
    renderComponent();
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('default.levelB2');
    expect(buttons[1]).toHaveTextContent('default.levelC1');
  });

  it('powinien wyświetlać własne poziomy z propsa', () => {
    renderComponent({ levels: customLevels });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('default.levelA1');
    expect(buttons[1]).toHaveTextContent('default.levelA2');
  });

  it('powinien wyświetlać tylko ikony gdy onlyIcons=true', () => {
    renderComponent({ levels: customLevels, onlyIcons: true });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0]).toHaveTextContent('🎮');
    expect(buttons[0]).not.toHaveTextContent('levelA1');
    expect(buttons[1]).toHaveTextContent('🌟');
    expect(buttons[1]).not.toHaveTextContent('levelA2');
  });

  it('powinien wywołać setDisplay z odpowiednią wartością po kliknięciu', () => {
    renderComponent({ levels: customLevels });
    fireEvent.click(screen.getByText('default.levelA1'));
    expect(mockSetDisplay).toHaveBeenCalledWith('A1');
  });

  it('powinien używać poprawnych ID wiadomości dla różnych gametype', () => {
    renderComponent({ gametype: 'vocab' });
    expect(screen.getByText('vocab.chooseLevel')).toBeInTheDocument();
    expect(screen.getByText('vocab.gametype')).toBeInTheDocument();
    expect(screen.getByText('vocab.chooseTest')).toBeInTheDocument();
  });

  it('powinien renderować prawidłową strukturę DOM', () => {
    const { container } = renderComponent();
    expect(container.querySelector('.select-container')).toBeInTheDocument();
    expect(container.querySelector('.select-window')).toBeInTheDocument();
    expect(container.querySelector('h1')).toHaveTextContent('default.chooseLevel');
    expect(container.querySelector('p')).toHaveTextContent('default.chooseTest');
  });
});
