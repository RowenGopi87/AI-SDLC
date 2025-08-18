import React from 'react';
import { render, screen } from '../../utils/test-helpers';

// Simple smoke test to verify testing setup
describe('AuraV2 Testing Setup', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Test Component</div>;
    render(<TestComponent />);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle mock fetch calls', async () => {
    const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ test: 'data' })
    } as Response);

    const response = await fetch('/test');
    const data = await response.json();

    expect(data).toEqual({ test: 'data' });
    expect(mockFetch).toHaveBeenCalledWith('/test');
  });

  it('should have proper TypeScript support', () => {
    interface TestInterface {
      name: string;
      value: number;
    }

    const testObject: TestInterface = { name: 'test', value: 42 };
    expect(testObject.name).toBe('test');
    expect(testObject.value).toBe(42);
  });

  it('should support async/await patterns', async () => {
    const asyncFunction = async (): Promise<string> => {
      return new Promise(resolve => {
        setTimeout(() => resolve('async result'), 10);
      });
    };

    const result = await asyncFunction();
    expect(result).toBe('async result');
  });
});
