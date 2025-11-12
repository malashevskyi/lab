import { stripMarkdown } from './stripMarkdown';

describe('stripMarkdown', () => {
  describe('basic markdown formatting', () => {
    it('should remove bold formatting', () => {
      expect(stripMarkdown('This is **bold** text')).toBe('This is bold text');
      expect(stripMarkdown('**All bold**')).toBe('All bold');
    });

    it('should remove italic formatting', () => {
      expect(stripMarkdown('This is *italic* text')).toBe(
        'This is italic text',
      );
      expect(stripMarkdown('*All italic*')).toBe('All italic');
    });

    it('should remove inline code', () => {
      expect(stripMarkdown('Use `console.log()` function')).toBe(
        'Use console.log() function',
      );
      expect(stripMarkdown('The `<div>` element')).toBe('The element');
    });

    it('should remove strikethrough', () => {
      expect(stripMarkdown('This is ~~deleted~~ text')).toBe(
        'This is deleted text',
      );
    });

    it('should remove headers', () => {
      expect(stripMarkdown('# Heading 1')).toBe('Heading 1');
      expect(stripMarkdown('## Heading 2')).toBe('Heading 2');
      expect(stripMarkdown('### Heading 3')).toBe('Heading 3');
      expect(stripMarkdown('#### Heading 4')).toBe('Heading 4');
      expect(stripMarkdown('##### Heading 5')).toBe('Heading 5');
      expect(stripMarkdown('###### Heading 6')).toBe('Heading 6');
    });
  });

  describe('links and images', () => {
    it('should remove links but keep text', () => {
      expect(stripMarkdown('Visit [OpenAI](https://openai.com)')).toBe(
        'Visit OpenAI',
      );
      expect(
        stripMarkdown('Check [this link](https://example.com) for details'),
      ).toBe('Check this link for details');
    });

    it('should remove images completely', () => {
      expect(stripMarkdown('![Alt text](image.jpg)')).toBe('');
      expect(stripMarkdown('Text before ![image](img.png) text after')).toBe(
        'Text before text after',
      );
    });
  });

  describe('code blocks', () => {
    it('should remove code blocks', () => {
      const input = 'Text before\n```javascript\nconst x = 1;\n```\nText after';
      expect(stripMarkdown(input)).toBe('Text before Text after');
    });

    it('should remove code blocks without language', () => {
      const input = 'Text before\n```\nsome code\n```\nText after';
      expect(stripMarkdown(input)).toBe('Text before Text after');
    });

    it('should remove multiple code blocks', () => {
      const input =
        'Start\n```js\ncode1\n```\nMiddle\n```python\ncode2\n```\nEnd';
      expect(stripMarkdown(input)).toBe('Start Middle End');
    });
  });

  describe('lists', () => {
    it('should remove unordered list markers', () => {
      expect(stripMarkdown('- Item 1')).toBe('Item 1');
      expect(stripMarkdown('* Item 2')).toBe('Item 2');
      expect(stripMarkdown('+ Item 3')).toBe('Item 3');
    });

    it('should remove ordered list markers', () => {
      expect(stripMarkdown('1. First item')).toBe('First item');
      expect(stripMarkdown('2. Second item')).toBe('Second item');
      expect(stripMarkdown('10. Tenth item')).toBe('Tenth item');
    });

    it('should handle nested lists', () => {
      const input = '- Item 1\n  - Nested item';
      expect(stripMarkdown(input)).toBe('Item 1 Nested item');
    });
  });

  describe('blockquotes and rules', () => {
    it('should remove blockquote markers', () => {
      expect(stripMarkdown('> This is a quote')).toBe('This is a quote');
      expect(stripMarkdown('> Line 1\n> Line 2')).toBe('Line 1 Line 2');
    });

    it('should remove horizontal rules', () => {
      expect(stripMarkdown('Text\n---\nMore text')).toBe('Text More text');
      expect(stripMarkdown('Text\n***\nMore text')).toBe('Text More text');
      expect(stripMarkdown('Text\n___\nMore text')).toBe('Text More text');
    });
  });

  describe('HTML tags', () => {
    it('should remove HTML tags', () => {
      expect(stripMarkdown('Text with <strong>HTML</strong>')).toBe(
        'Text with HTML',
      );
      expect(
        stripMarkdown('Text with <div>nested <span>tags</span></div>'),
      ).toBe('Text with nested tags');
    });

    it('should remove script tags', () => {
      expect(
        stripMarkdown('Text <script>alert("xss")</script> more text'),
      ).toBe('Text more text');
    });
  });

  describe('complex markdown', () => {
    it('should handle multiple formatting types', () => {
      const input =
        '**Bold** and *italic* with `code` and [link](url) and ~~strike~~';
      expect(stripMarkdown(input)).toBe(
        'Bold and italic with code and link and strike',
      );
    });

    it('should handle flashcard question example', () => {
      const input =
        'What is the difference between **`const`** and **`let`** in JavaScript?';
      expect(stripMarkdown(input)).toBe(
        'What is the difference between const and let in JavaScript?',
      );
    });

    it('should handle nested formatting', () => {
      const input = '**Bold with *italic* inside**';
      expect(stripMarkdown(input)).toBe('Bold with italic inside');
    });

    it('should handle mixed content with code blocks', () => {
      const input =
        '## Heading\n\nText with **bold** and `code`.\n\n```js\nconst x = 1;\n```\n\n- List item';
      expect(stripMarkdown(input)).toBe(
        'Heading Text with bold and code. List item',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(stripMarkdown('')).toBe('');
    });

    it('should handle plain text', () => {
      expect(stripMarkdown('Just plain text')).toBe('Just plain text');
    });

    it('should clean up multiple spaces', () => {
      expect(stripMarkdown('Text   with    multiple     spaces')).toBe(
        'Text with multiple spaces',
      );
    });

    it('should trim whitespace', () => {
      expect(stripMarkdown('  Text with spaces  ')).toBe('Text with spaces');
    });

    it('should handle special characters', () => {
      expect(stripMarkdown('Text with & and < and > symbols')).toBe(
        'Text with & and symbols',
      );
    });
  });

  describe('real-world flashcard examples', () => {
    it('should clean programming question', () => {
      const input = 'Explain the **`async/await`** syntax in JavaScript';
      expect(stripMarkdown(input)).toBe(
        'Explain the async/await syntax in JavaScript',
      );
    });

    it('should clean question with code example', () => {
      const input =
        'What does `Array.prototype.map()` do?\n\n```javascript\nconst arr = [1, 2, 3];\n```';
      expect(stripMarkdown(input)).toBe('What does Array.prototype.map() do?');
    });

    it('should clean question with multiple formats', () => {
      const input =
        '### Question\n\nWhat is the difference between:\n- **`null`**\n- **`undefined`**';
      expect(stripMarkdown(input)).toBe(
        'Question What is the difference between: null undefined',
      );
    });

    it('should clean question with links', () => {
      const input =
        'Explain [REST API](https://developer.mozilla.org/en-US/docs/Glossary/REST) principles';
      expect(stripMarkdown(input)).toBe('Explain REST API principles');
    });
  });
});
