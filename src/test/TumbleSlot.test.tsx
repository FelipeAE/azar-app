import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TumbleSlot } from '../components/TumbleSlot';

describe('TumbleSlot', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<TumbleSlot />);
    expect(screen.getByText(/Gates of Olympus Style/i)).toBeInTheDocument();
    expect(screen.getByText(/GIRAR/i)).toBeInTheDocument();
  });

  it('displays initial balance', () => {
    render(<TumbleSlot />);
    expect(screen.getByText(/\$10000\.00/)).toBeInTheDocument();
  });

  it('shows bet selection dropdown', () => {
    render(<TumbleSlot />);
    const betSelect = screen.getByDisplayValue('$100');
    expect(betSelect).toBeInTheDocument();
  });

  it('allows changing bet amount', () => {
    render(<TumbleSlot />);
    const betSelect = screen.getByDisplayValue('$100');
    fireEvent.change(betSelect, { target: { value: '200' } });
    expect(screen.getByDisplayValue('$200')).toBeInTheDocument();
  });

  it('spin button is disabled when balance is insufficient', () => {
    // Set balance to 0
    localStorage.setItem('tumble_slot_stats', JSON.stringify({ 
      balance: 0, 
      stats: { totalSpins: 0, totalWagered: 0, totalWon: 0, biggestWin: 0, biggestMultiplier: 1 } 
    }));
    
    render(<TumbleSlot />);
    const spinButton = screen.getByRole('button', { name: /GIRAR/i });
    expect(spinButton).toBeDisabled();
  });

  it('shows auto-spin buttons', () => {
    render(<TumbleSlot />);
    expect(screen.getByText(/AUTO 10/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTO 20/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTO 50/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTO 100/i)).toBeInTheDocument();
  });

  it('shows ante bet toggle button', () => {
    render(<TumbleSlot />);
    expect(screen.getByText(/ANTE BET \(25%\)/i)).toBeInTheDocument();
  });

  it('shows buy bonus button', () => {
    render(<TumbleSlot />);
    expect(screen.getByText(/COMPRAR BONUS/i)).toBeInTheDocument();
  });

  it('displays statistics', () => {
    render(<TumbleSlot />);
    expect(screen.getByText(/Giros/i)).toBeInTheDocument();
    expect(screen.getByText(/Apostado/i)).toBeInTheDocument();
    expect(screen.getByText(/Ganado/i)).toBeInTheDocument();
  });

  it('loads saved statistics from localStorage', () => {
    const savedData = {
      stats: {
        totalSpins: 10,
        totalWagered: 1000,
        totalWon: 500,
        biggestWin: 200,
        biggestMultiplier: 5,
      },
      balance: 5000,
    };
    localStorage.setItem('tumble_slot_stats', JSON.stringify(savedData));

    render(<TumbleSlot />);
    expect(screen.getByText('10')).toBeInTheDocument(); // totalSpins
    expect(screen.getByText(/\$5000\.00/)).toBeInTheDocument(); // balance
  });

  it('toggles paytable when button is clicked', () => {
    render(<TumbleSlot />);
    const paytableButton = screen.getByText(/PAGOS/i);
    
    fireEvent.click(paytableButton);
    expect(screen.getByText(/TABLA DE PAGOS/i)).toBeInTheDocument();
    
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    waitFor(() => {
      expect(screen.queryByText(/TABLA DE PAGOS/i)).not.toBeInTheDocument();
    });
  });
});
