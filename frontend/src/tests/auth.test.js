import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import LoginPage from '../pages/auth/LoginPage';

// Mock useAuth hook
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isAuthenticated: false
  })
}));

describe('Login Page', () => {
  test('renders login form', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );
    });
    
    // Check for essential form elements
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
}); 