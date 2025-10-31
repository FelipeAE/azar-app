import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaraCruz } from '../components/CaraCruz';

describe('CaraCruz', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<CaraCruz />);
    expect(screen.getByText(/Cara o Cruz/i)).toBeInTheDocument();
  });

  it('shows flip button', () => {
    render(<CaraCruz />);
    expect(screen.getByText(/¡Lanzar Moneda!/i)).toBeInTheDocument();
  });

  it('displays statistics section', () => {
    render(<CaraCruz />);
    expect(screen.getByText(/Estadísticas/i)).toBeInTheDocument();
    expect(screen.getByText(/Total de lanzamientos/i)).toBeInTheDocument();
  });

  it('shows CARA and CRUZ sections in statistics', () => {
    render(<CaraCruz />);
    expect(screen.getByText('CARA')).toBeInTheDocument();
    expect(screen.getByText('CRUZ')).toBeInTheDocument();
  });

  it('disables button while flipping', () => {
    render(<CaraCruz />);
    const button = screen.getByText(/¡Lanzar Moneda!/i);
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(screen.getByText(/Lanzando.../i)).toBeInTheDocument();
  });

  it('loads saved statistics from localStorage', () => {
    const savedData = {
      cara: 10,
      cruz: 8,
    };
    localStorage.setItem('caracruz_stats', JSON.stringify(savedData));

    render(<CaraCruz />);
    expect(screen.getByText('10')).toBeInTheDocument(); // cara count
    expect(screen.getByText('8')).toBeInTheDocument(); // cruz count
    expect(screen.getByText('18')).toBeInTheDocument(); // total
  });

  it('shows reset button when there are flips', () => {
    const savedData = {
      cara: 5,
      cruz: 3,
    };
    localStorage.setItem('caracruz_stats', JSON.stringify(savedData));

    render(<CaraCruz />);
    expect(screen.getByText(/Reiniciar Contadores/i)).toBeInTheDocument();
  });

  it('displays percentages correctly', () => {
    const savedData = {
      cara: 6,
      cruz: 4,
    };
    localStorage.setItem('caracruz_stats', JSON.stringify(savedData));

    render(<CaraCruz />);
    // 6/10 = 60%, 4/10 = 40%
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('40.0%')).toBeInTheDocument();
  });
});
