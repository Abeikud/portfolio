import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders a main landmark', () => {
    render(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('shows the main menu', () => {
    render(<App />);
    expect(screen.getByRole('navigation', { name: 'Main menu' })).toBeInTheDocument();
  });
});
