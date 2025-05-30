import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
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
  test('renders home page content', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );
    
    // Check for main heading
    expect(screen.getByText(/Welcome to Our Gym/i)).toBeInTheDocument();
  });
}); 