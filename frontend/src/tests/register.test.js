import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../pages/auth/RegisterPage';
import fs from 'fs';
import path from 'path';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  defaults: {
    headers: {
      common: {}
    }
  }
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
        <RegisterPage />
      </BrowserRouter>
    );
    
    // Check for basic form elements
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    console.log('Register page rendered successfully');
  });
}); 