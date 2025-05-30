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
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });
}); 