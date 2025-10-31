import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TumbleSlot } from '../components/TumbleSlot';

describe('TumbleSlot - Auto Spin Debug Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('balance', '10000');
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('should start auto-spin with 10 spins', async () => {
    render(<TumbleSlot />);
    
    const auto10Button = screen.getByText(/AUTO 10/i);
    fireEvent.click(auto10Button);
    
    // Should show remaining spins
    await waitFor(() => {
      expect(screen.getByText(/RESTANTES:/i)).toBeInTheDocument();
    });
  });

  it('should decrement remaining spins after each spin', async () => {
    render(<TumbleSlot />);
    
    const auto10Button = screen.getByText(/AUTO 10/i);
    fireEvent.click(auto10Button);
    
    // Wait for first spin to start
    await waitFor(() => {
      expect(screen.getByText(/RESTANTES:/i)).toBeInTheDocument();
    });

    // Log initial state
    console.log('Initial DOM after starting auto-spin:');
    console.log(document.body.innerHTML.substring(0, 500));
    
    // Fast-forward through spin animation (3000ms)
    vi.advanceTimersByTime(3000);
    
    console.log('After 3000ms (should have completed first spin):');
    console.log(document.body.innerHTML.substring(0, 500));
    
    // Fast-forward through cascade delay (500ms)
    vi.advanceTimersByTime(500);
    
    console.log('After 3500ms total:');
    console.log(document.body.innerHTML.substring(0, 500));
  });

  it('should continue auto-spin automatically', async () => {
    render(<TumbleSlot />);
    
    const auto10Button = screen.getByText(/AUTO 10/i);
    fireEvent.click(auto10Button);
    
    // Wait for auto-spin to start
    await waitFor(() => {
      expect(screen.getByText(/RESTANTES:/i)).toBeInTheDocument();
    });

    // Fast-forward through first spin (3000ms spin + 500ms cascade + 1000ms delay)
    vi.advanceTimersByTime(4500);
    
    // Should still be in auto-spin mode with 9 remaining
    await waitFor(() => {
      const remainingText = screen.queryByText(/RESTANTES:/i);
      console.log('Remaining text found:', remainingText?.textContent);
      expect(remainingText).toBeInTheDocument();
    });
  });

  it('should stop auto-spin when stop button is clicked', async () => {
    render(<TumbleSlot />);
    
    const auto10Button = screen.getByText(/AUTO 10/i);
    fireEvent.click(auto10Button);
    
    await waitFor(() => {
      expect(screen.getByText(/DETENER/i)).toBeInTheDocument();
    });

    const stopButton = screen.getByText(/DETENER/i);
    fireEvent.click(stopButton);
    
    // Should not show remaining spins anymore
    await waitFor(() => {
      expect(screen.queryByText(/RESTANTES:/i)).not.toBeInTheDocument();
    });
  });

  it('should stop auto-spin when balance is too low', async () => {
    localStorage.setItem('balance', '100'); // Low balance
    render(<TumbleSlot />);
    
    const auto10Button = screen.getByText(/AUTO 10/i);
    fireEvent.click(auto10Button);
    
    // Fast-forward through first spin
    vi.advanceTimersByTime(4500);
    
    // Should stop due to low balance
    await waitFor(() => {
      expect(screen.queryByText(/RESTANTES:/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('should log state changes during auto-spin', async () => {
    const consoleSpy = vi.spyOn(console, 'log');
    
    render(<TumbleSlot />);
    
    const auto10Button = screen.getByText(/AUTO 10/i);
    fireEvent.click(auto10Button);
    
    // Log all console output
    await waitFor(() => {
      expect(screen.getByText(/RESTANTES:/i)).toBeInTheDocument();
    });

    vi.advanceTimersByTime(5000);
    
    console.log('All console logs:', consoleSpy.mock.calls);
  });
});
