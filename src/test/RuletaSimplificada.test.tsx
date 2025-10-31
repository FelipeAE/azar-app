import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RuletaSimplificada } from '../components/RuletaSimplificada';

describe('RuletaSimplificada', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<RuletaSimplificada />);
    expect(screen.getByText(/Ruleta Simplificada/i)).toBeInTheDocument();
  });

  it('shows spin button', () => {
    render(<RuletaSimplificada />);
    const spinButton = screen.getByRole('button', { name: /GIRAR/i });
    expect(spinButton).toBeInTheDocument();
  });

  it('displays statistics', () => {
    render(<RuletaSimplificada />);
    expect(screen.getByText(/Estadísticas/i)).toBeInTheDocument();
  });
});
