import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

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

// Mock console methods
const originalConsole = { ...console };
const consoleOutput = [];

beforeAll(() => {
  console.log = (...args) => {
    consoleOutput.push(['LOG', ...args]);
    originalConsole.log(...args);
  };
  console.error = (...args) => {
    consoleOutput.push(['ERROR', ...args]);
    originalConsole.error(...args);
  };
  console.warn = (...args) => {
    consoleOutput.push(['WARN', ...args]);
    originalConsole.warn(...args);
  };
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;

  // Save console output to file
  const outputDir = path.join(process.cwd(), 'test_reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Save all test results
  const testResults = consoleOutput.map(([type, ...args]) => `[${type}] ${args.join(' ')}`).join('\n');

  fs.writeFileSync(
    path.join(outputDir, 'frontend_test.txt'),
    testResults
  );
});

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

    await act(async () => {
      renderLoginPage();
    });
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
    });

    // Wait for the login process to complete and navigation to occur
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login/', {
        username: 'testuser',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/profile', { replace: true });
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

    await act(async () => {
      renderLoginPage();
    });
    
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);
    });

    // Wait for the error message to appear
    await waitFor(() => {
      const errorMessage = screen.getByText(/login failed/i);
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage.textContent).toContain('Login failed');
    });
  });
}); 