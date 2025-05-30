import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import RegisterPage from '../pages/auth/RegisterPage';

// Mock useAuth hook
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    isAuthenticated: false
  })
}));

describe('Register Page', () => {
  test('renders register form', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      );
    });
    
    // Check for essential form elements
    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/i })).toBeInTheDocument();
  });
}); 