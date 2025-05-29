import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import axios from 'axios';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock window.alert
window.alert = jest.fn();

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Authentication Tests', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    window.alert.mockClear();
    axios.post.mockClear();
  });

  test('TC-004: Valid Login', async () => {
    // Mock successful login response
    axios.post.mockResolvedValueOnce({
      data: {
        user: { id: 1, username: 'testuser' },
        access: 'access-token',
        refresh: 'refresh-token'
      }
    });

    renderLoginPage();
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Check if the form is submitted
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/signing in/i)).toBeInTheDocument();

    // Wait for the login process to complete
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login/', {
        username: 'testuser',
        password: 'password123'
      });
    });
  });

  test('TC-005: Invalid Password', async () => {
    // Mock failed login response
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Login failed. Please check credentials.'
        }
      }
    });

    renderLoginPage();
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/login failed/i)).toBeInTheDocument();
    });
  });
}); 