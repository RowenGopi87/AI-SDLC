import '@testing-library/jest-dom';
import React from 'react';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/aurav2/idea',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return React.createElement('a', { href }, children);
  };
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock window.alert
global.alert = jest.fn();

// Polyfill Web APIs for Next.js API routes
import 'whatwg-fetch';

// Simple polyfills for Request constructor used in tests
if (typeof global.Request === 'undefined') {
  global.Request = class MockRequest {
    url: string;
    method: string;
    headers: any;
    body: any;

    constructor(url: string, init: any = {}) {
      this.url = url;
      this.method = init.method || 'GET';
      this.headers = init.headers || {};
      this.body = init.body;
    }

    async json() {
      return JSON.parse(this.body || '{}');
    }
  } as any;
}

// Mock console methods to reduce noise in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
