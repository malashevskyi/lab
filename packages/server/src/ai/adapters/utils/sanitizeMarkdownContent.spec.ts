import { sanitizeMarkdownContent } from './sanitizeMarkdownContent';

describe('sanitizeMarkdownContent', () => {
  describe('text content sanitization', () => {
    it('should sanitize HTML tags from text content', () => {
      const input =
        'Regular text with <script>alert("hack")</script> malicious content';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe('Regular text with  malicious content');
    });

    it('should keep markdown formatting in text', () => {
      const input = 'Text with **bold** and *italic* and `inline code`';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe('Text with **bold** and *italic* and `inline code`');
    });

    it('should sanitize HTML from list items', () => {
      const input = '- Item with <span>HTML</span>\n- Another <b>item</b>';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe('- Item with HTML\n- Another item');
    });

    it('should remove script tags from text', () => {
      const input =
        'Safe text <script type="text/javascript">alert("xss")</script> more text';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe('Safe text  more text');
    });
  });

  describe('code block preservation', () => {
    it('should preserve HTML tags in JavaScript code blocks', () => {
      const input =
        '```javascript\nconst html = "<div>Hello</div>";\nalert(html);\n```';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        '```javascript\nconst html = "<div>Hello</div>";\nalert(html);\n```',
      );
    });

    it('should preserve script tags in code blocks', () => {
      const input =
        '```html\n<script>\n  console.log("This should stay");\n</script>\n```';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        '```html\n<script>\n  console.log("This should stay");\n</script>\n```',
      );
    });

    it('should preserve complex HTML in code blocks', () => {
      const input =
        '```html\n<div class="container">\n  <script src="malicious.js"></script>\n  <img onerror="alert(\'xss\')" src="x">\n</div>\n```';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        '```html\n<div class="container">\n  <script src="malicious.js"></script>\n  <img onerror="alert(\'xss\')" src="x">\n</div>\n```',
      );
    });

    it('should preserve code without language specification', () => {
      const input =
        '```\n<dangerous>content</dangerous>\nscript.execute();\n```';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        '```\n<dangerous>content</dangerous>\nscript.execute();\n```',
      );
    });
  });

  describe('mixed content', () => {
    it('should sanitize text but preserve code blocks', () => {
      const input =
        'Text with <script>bad()</script> stuff\n\n```javascript\nconst code = "<script>good()</script>";\n```\n\nMore <b>text</b> here';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        'Text with  stuff\n\n```javascript\nconst code = "<script>good()</script>";\n```\n\nMore text here',
      );
    });

    it('should handle multiple code blocks', () => {
      const input =
        'Start <span>text</span>\n\n```js\nalert("code1");\n```\n\nMiddle <div>text</div>\n\n```html\n<script>alert("code2")</script>\n```\n\nEnd text';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        'Start text\n\n```js\nalert("code1");\n```\n\nMiddle text\n\n```html\n<script>alert("code2")</script>\n```\n\nEnd text',
      );
    });

    it('should handle text with lists and code blocks', () => {
      const input =
        'Introduction <b>text</b>\n\n- List with <span>HTML</span>\n- Another item\n\n```python\nprint("<h1>HTML in code</h1>")\n```\n\nConclusion text';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        'Introduction text\n\n- List with HTML\n- Another item\n\n```python\nprint("<h1>HTML in code</h1>")\n```\n\nConclusion text',
      );
    });
  });

  describe('edge cases', () => {
    it('should handle empty input', () => {
      const input = '';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe('');
    });

    it('should handle input with only code block', () => {
      const input = '```bash\nrm -rf / --no-preserve-root\n```';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe('```bash\nrm -rf / --no-preserve-root\n```');
    });

    it('should handle input with only text', () => {
      const input = 'Just text with <script>alert("test")</script> content';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe('Just text with  content');
    });

    it('should handle malformed HTML in text', () => {
      const input = 'Text with <unclosed tag and <script incomplete content';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe('Text with ');
    });

    it('should handle nested code-like strings in text', () => {
      const input = 'Text mentioning ```code``` but not a real code block';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        'Text mentioning ```code``` but not a real code block',
      );
    });

    it('should handle code block without closing', () => {
      const input =
        'Text before\n```javascript\nconsole.log("unclosed");\nText after';
      const result = sanitizeMarkdownContent(input);
      expect(result).toBe(
        'Text before\n```javascript\nconsole.log("unclosed");\nText after',
      );
    });
  });
});
