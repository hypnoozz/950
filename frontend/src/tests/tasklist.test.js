import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import fs from 'fs';
import path from 'path';
import { AuthProvider } from '../context/AuthContext';

// Mock axios
jest.mock('axios', () => ({
  get: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
}));

// Mock the auth context
jest.mock('../context/AuthContext', () => ({
  ...jest.requireActual('../context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: true,
    user: { username: 'testuser' },
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

describe('Home Page', () => {
  test('renders home page content', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </BrowserRouter>
    );
    
    // Check for main heading
    expect(screen.getByRole('heading', { name: 'Transform Your Fitness Journey' })).toBeInTheDocument();
    console.log('Home page rendered successfully');
  });
}); 