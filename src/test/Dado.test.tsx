import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dado } from '../components/Dado';

describe('Dado', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<Dado />);
    expect(screen.getByText(/🎲 Lanzar Dado/i)).toBeInTheDocument();
  });

  it('shows dice with question mark initially', () => {
    render(<Dado />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows roll button', () => {
    render(<Dado />);
    expect(screen.getByText(/¡Lanzar Dado!/i)).toBeInTheDocument();
  });

  it('shows keyboard hint', () => {
    render(<Dado />);
    expect(screen.getByText(/Presiona ESPACIO para lanzar/i)).toBeInTheDocument();
  });

  it('displays statistics section', () => {
    render(<Dado />);
    expect(screen.getByText(/Estadísticas/i)).toBeInTheDocument();
    expect(screen.getByText(/Total de lanzamientos/i)).toBeInTheDocument();
  });

  it('shows all dice numbers in statistics', () => {
    render(<Dado />);
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByText(`Nº ${i}`)).toBeInTheDocument();
    }
  });

  it('disables button while rolling', () => {
    render(<Dado />);
    const button = screen.getByText(/¡Lanzar Dado!/i);
    fireEvent.click(button);
    expect(button).toBeDisabled();
    expect(screen.getByText(/Lanzando.../i)).toBeInTheDocument();
  });

  it('loads saved statistics from localStorage', () => {
    const savedData = {
      stats: { 1: 5, 2: 3, 3: 8, 4: 2, 5: 6, 6: 4 },
      history: [3, 5, 1, 6],
    };
    localStorage.setItem('dado_stats', JSON.stringify(savedData));

    render(<Dado />);
    expect(screen.getByText(/Total de lanzamientos/i)).toBeInTheDocument();
    // Total should be 28 (5+3+8+2+6+4)
    expect(screen.getByText('28')).toBeInTheDocument();
  });

  it('shows reset button when there are rolls', () => {
    const savedData = {
      stats: { 1: 5, 2: 3, 3: 8, 4: 2, 5: 6, 6: 4 },
      history: [3, 5, 1],
    };
    localStorage.setItem('dado_stats', JSON.stringify(savedData));

    render(<Dado />);
    expect(screen.getByText(/Reiniciar/i)).toBeInTheDocument();
  });

  it('shows history section when there are previous rolls', () => {
    const savedData = {
      stats: { 1: 1, 2: 1, 3: 1, 4: 0, 5: 0, 6: 0 },
      history: [3, 2, 1],
    };
    localStorage.setItem('dado_stats', JSON.stringify(savedData));

    render(<Dado />);
    expect(screen.getByText(/Últimas jugadas/i)).toBeInTheDocument();
  });
});
