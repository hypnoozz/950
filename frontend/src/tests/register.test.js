import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../pages/auth/RegisterPage';
import fs from 'fs';
import path from 'path';
import { AuthProvider } from '../context/AuthContext';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock useAuth hook
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: false,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  })
}));

const originalConsole = { ...console };
const consoleOutput = [];

beforeAll(() => {
  console.log = (...args) => {
    consoleOutput.push(['LOG', ...args]);
    originalConsole.log(...args);
  };
});

afterAll(() => {
  console.log = originalConsole.log;
  const outputDir = path.join(process.cwd(), 'test_reports');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const testResults = consoleOutput.map(([type, ...args]) => `[${type}] ${args.join(' ')}`).join('\n');
  fs.appendFileSync(path.join(outputDir, 'frontend_test.txt'), testResults + '\n');
});

describe('Register Page', () => {
  test('renders register form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check for heading
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    
    // Check for form elements
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
    console.log('Register page rendered successfully');
  });
}); 