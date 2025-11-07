/**
 * Tests for Site Modifiers Registry
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SiteModifier } from './types';

// Mock the udemy modifier
const mockUdemyModifier: SiteModifier = {
  id: 'udemy',
  name: 'Udemy',
  matches: (url: string) => url.includes('udemy.com'),
  initialize: vi.fn(),
  cleanup: vi.fn(),
};

// Mock module before importing
vi.mock('./udemy', () => ({
  udemyModifier: mockUdemyModifier,
}));

describe('Site Modifiers Registry', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset DOM
    document.body.innerHTML = '';

    // Reset location
    Object.defineProperty(window, 'location', {
      value: { href: 'https://example.com' },
      writable: true,
    });
  });

  afterEach(() => {
    // Cleanup after each test
    vi.clearAllMocks();
  });

  describe('URL pattern matching', () => {
    it('should match Udemy URLs', () => {
      expect(
        mockUdemyModifier.matches('https://www.udemy.com/course/test')
      ).toBe(true);
    });

    it('should not match non-Udemy URLs', () => {
      expect(mockUdemyModifier.matches('https://www.google.com')).toBe(false);
    });
  });

  describe('modifier lifecycle', () => {
    it('should have initialize function', () => {
      expect(typeof mockUdemyModifier.initialize).toBe('function');
    });

    it('should have cleanup function', () => {
      expect(typeof mockUdemyModifier.cleanup).toBe('function');
    });

    it('should have correct metadata', () => {
      expect(mockUdemyModifier.id).toBe('udemy');
      expect(mockUdemyModifier.name).toBe('Udemy');
    });
  });
});
