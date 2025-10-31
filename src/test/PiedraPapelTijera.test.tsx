import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PiedraPapelTijera } from '../components/PiedraPapelTijera';

describe('PiedraPapelTijera', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<PiedraPapelTijera />);
    expect(screen.getByText(/Piedra, Papel o Tijera/i)).toBeInTheDocument();
  });

  it('shows all three choice buttons', () => {
    render(<PiedraPapelTijera />);
    expect(screen.getByText(/🪨/)).toBeInTheDocument(); // Piedra
    expect(screen.getByText(/📄/)).toBeInTheDocument(); // Papel
    expect(screen.getByText(/✂️/)).toBeInTheDocument(); // Tijera
  });

  it('displays statistics section', () => {
    render(<PiedraPapelTijera />);
    expect(screen.getByText(/Estadísticas/i)).toBeInTheDocument();
  });
});
