import { describe, it, expect } from 'vitest';
import { normalizeUrl } from './normalizeUrl';

describe('normalizeUrl', () => {
  describe('Udemy URLs', () => {
    it('should normalize Udemy course lecture URL to base course URL', () => {
      const url =
        'https://www.udemy.com/course/microservices-with-node-js-and-react/learn/lecture/18504136#overview';
      const expected =
        'https://www.udemy.com/course/microservices-with-node-js-and-react';

      expect(normalizeUrl(url)).toBe(expected);
    });

    it('should normalize Udemy course URL without lecture details', () => {
      const url =
        'https://www.udemy.com/course/microservices-with-node-js-and-react/learn/';
      const expected =
        'https://www.udemy.com/course/microservices-with-node-js-and-react';

      expect(normalizeUrl(url)).toBe(expected);
    });

    it('should handle Udemy course URL that is already normalized', () => {
      const url =
        'https://www.udemy.com/course/microservices-with-node-js-and-react';

      expect(normalizeUrl(url)).toBe(url);
    });

    it('should handle Udemy course URL with trailing slash', () => {
      const url =
        'https://www.udemy.com/course/microservices-with-node-js-and-react/';
      const expected =
        'https://www.udemy.com/course/microservices-with-node-js-and-react';

      expect(normalizeUrl(url)).toBe(expected);
    });

    it('should work with different Udemy subdomains', () => {
      const url =
        'https://udemy.com/course/python-bootcamp/learn/lecture/12345';
      const expected = 'https://udemy.com/course/python-bootcamp';

      expect(normalizeUrl(url)).toBe(expected);
    });
  });

  describe('Non-Udemy URLs', () => {
    it('should return the original URL for YouTube', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

      expect(normalizeUrl(url)).toBe(url);
    });

    it('should return the original URL for GitHub', () => {
      const url = 'https://github.com/user/repo/blob/main/README.md';

      expect(normalizeUrl(url)).toBe(url);
    });

    it('should return the original URL for regular websites', () => {
      const url = 'https://example.com/path/to/page';

      expect(normalizeUrl(url)).toBe(url);
    });
  });

  describe('Edge cases', () => {
    it('should handle invalid URLs gracefully', () => {
      const invalidUrl = 'not-a-valid-url';

      expect(normalizeUrl(invalidUrl)).toBe(invalidUrl);
    });

    it('should handle empty string', () => {
      expect(normalizeUrl('')).toBe('');
    });

    it('should handle URLs with query parameters on Udemy', () => {
      const url =
        'https://www.udemy.com/course/test-course/learn/lecture/123?param=value';
      const expected = 'https://www.udemy.com/course/test-course';

      expect(normalizeUrl(url)).toBe(expected);
    });
  });
});
