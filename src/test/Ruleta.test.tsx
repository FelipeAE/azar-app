import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Ruleta } from '../components/Ruleta';

describe('Ruleta', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    render(<Ruleta />);
    expect(screen.getByText(/🎰 Ruleta de Casino/i)).toBeInTheDocument();
  });

  it('shows spin button', () => {
    render(<Ruleta />);
    expect(screen.getByText(/GIRAR RULETA/i)).toBeInTheDocument();
  });

  it('displays betting options', () => {
    render(<Ruleta />);
    expect(screen.getByText(/Rojo/i)).toBeInTheDocument();
    expect(screen.getByText(/Negro/i)).toBeInTheDocument();
  });

  it('displays balance', () => {
    render(<Ruleta />);
    expect(screen.getByText(/Balance:/i)).toBeInTheDocument();
  });
});
