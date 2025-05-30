import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import HomePage from '../pages/HomePage';

// Mock useAuth hook
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, email: 'test@example.com' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn()
  })
}));

describe('Home Page', () => {
  test('renders home page content', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <HomePage />
        </BrowserRouter>
      );
    });
    
    // Check for main heading
    expect(screen.getByRole('heading', { name: /transform your fitness journey/i })).toBeInTheDocument();
  });
}); 