import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

// Mock the widgetApiPromise that App component expects
const mockWidgetApiPromise = Promise.resolve({});

describe('App', () => {
  it('renders without crashing', () => {
    render(<App widgetApiPromise={mockWidgetApiPromise} />);
    // This is a simple check - we might need to update this if there's a specific element to test for
    expect(document.body).toBeDefined();
  });
});
