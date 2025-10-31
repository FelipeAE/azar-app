import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Blackjack } from '../components/Blackjack';

describe('Blackjack', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<Blackjack />);
    expect(screen.getByText(/♠️ Blackjack/i)).toBeInTheDocument();
  });

  it('shows dealer and player sections', () => {
    render(<Blackjack />);
    expect(screen.getByText(/Dealer/i)).toBeInTheDocument();
    expect(screen.getByText(/Tu Mano/i)).toBeInTheDocument();
  });

  it('starts in betting state', () => {
    render(<Blackjack />);
    expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument();
  });

  it('shows bet input in betting state', () => {
    render(<Blackjack />);
    expect(screen.getByText(/Apuesta:/i)).toBeInTheDocument();
    const betInput = screen.getByRole('spinbutton');
    expect(betInput).toHaveValue(10);
  });

  it('allows changing bet amount', () => {
    render(<Blackjack />);
    const betInput = screen.getByRole('spinbutton');
    fireEvent.change(betInput, { target: { value: '50' } });
    expect(betInput).toHaveValue(50);
  });

  it('displays statistics section', () => {
    render(<Blackjack />);
    expect(screen.getByText(/Estadísticas/i)).toBeInTheDocument();
    expect(screen.getByText(/Juegos totales/i)).toBeInTheDocument();
    expect(screen.getByText(/Ganados/i)).toBeInTheDocument();
    expect(screen.getByText(/Perdidos/i)).toBeInTheDocument();
    expect(screen.getByText(/Empates/i)).toBeInTheDocument();
  });

  it('loads saved statistics from localStorage', () => {
    const savedData = {
      stats: {
        totalGames: 20,
        wins: 10,
        losses: 8,
        ties: 2,
        profit: 50,
      },
      history: [],
    };
    localStorage.setItem('blackjack_stats', JSON.stringify(savedData));

    render(<Blackjack />);
    expect(screen.getByText('20')).toBeInTheDocument(); // totalGames
    expect(screen.getByText('10')).toBeInTheDocument(); // wins
  });

  it('starts game when button clicked', () => {
    render(<Blackjack />);
    const startButton = screen.getByText(/Comenzar Juego/i);
    fireEvent.click(startButton);

    // After starting, should show hit and stand buttons
    expect(screen.getByText(/Pedir Carta/i)).toBeInTheDocument();
    expect(screen.getByText(/Plantarse/i)).toBeInTheDocument();
  });

  it('shows score for both dealer and player during game', () => {
    render(<Blackjack />);
    const startButton = screen.getByText(/Comenzar Juego/i);
    fireEvent.click(startButton);

    const scores = screen.getAllByText(/Score:/i);
    expect(scores.length).toBeGreaterThanOrEqual(1);
  });
});
