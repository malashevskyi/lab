import { describe, test, expect } from 'vitest';
import { renderListAsHtml } from './renderListAsHtml';

describe('renderListAsHtml', () => {
  describe('List blocks', () => {
    test('should parse simple unordered list', () => {
      const content = '- Item 1\n- Item 2';
      const result = renderListAsHtml(content);

      expect(result).toEqual('<ul><li>Item 1</li><li>Item 2</li></ul>');
    });

    test('should parse multiline list', () => {
      const content = `- First item
- Second item
- Third item`;
      const result = renderListAsHtml(content);

      expect(result).toEqual(
        '<ul><li>First item</li><li>Second item</li><li>Third item</li></ul>'
      );
    });

    test('should parse list with formatted content', () => {
      const content = `- **Bold item**
- *Italic item*`;
      const result = renderListAsHtml(content);

      expect(result).toEqual(
        '<ul><li><strong>Bold item</strong></li><li><em>Italic item</em></li></ul>'
      );
    });
  });

  describe('Edge cases', () => {
    test('should handle empty content', () => {
      const content = '';
      const result = renderListAsHtml(content);

      expect(result).toEqual('');
    });

    test('should handle whitespace-only content', () => {
      const content = '   \n\n  \t  \n   ';
      const result = renderListAsHtml(content);

      expect(result).toEqual('');
    });
  });
});
