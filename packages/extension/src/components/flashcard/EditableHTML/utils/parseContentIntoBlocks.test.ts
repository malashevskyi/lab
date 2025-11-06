import { describe, test, expect } from 'vitest';
import { parseContentIntoBlocks } from './parseContentIntoBlocks';

describe('parseContentIntoBlocks', () => {
  describe('Text content', () => {
    test('should parse simple text into single text block', () => {
      const content = 'Simple text content';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        { type: 'text', content: 'Simple text content' },
      ]);
    });

    test('should parse multiline text into separate text blocks', () => {
      const content = 'Line 1\nLine 2\nLine 3';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        { type: 'text', content: 'Line 1' },
        { type: 'text', content: 'Line 2' },
        { type: 'text', content: 'Line 3' },
      ]);
    });

    test('should handle empty lines and whitespace', () => {
      const content = 'Line 1\n\n  \nLine 2\n   ';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        { type: 'text', content: 'Line 1' },
        { type: 'text', content: 'Line 2' },
      ]);
    });
  });

  describe('Code blocks', () => {
    test('should parse code block with class attribute only', () => {
      const content =
        '<pre><code class="language-javascript">console.log("test");</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'console.log("test");',
          language: 'javascript',
        },
      ]);
    });

    test('should parse code block with data-language attribute only', () => {
      const content =
        '<pre><code data-language="html">&lt;div&gt;test&lt;/div&gt;</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: '<div>test</div>',
          language: 'html',
        },
      ]);
    });

    test('should parse code block with BOTH class and data-language attributes', () => {
      const content =
        '<pre><code class="language-python" data-language="python">print("hello")</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'print("hello")',
          language: 'python',
        },
      ]);
    });

    test('should parse code block with data-language first, then class', () => {
      const content =
        '<pre><code data-language="css" class="language-css">body { margin: 0; }</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'body { margin: 0; }',
          language: 'css',
        },
      ]);
    });

    test('should parse code block without language attributes', () => {
      const content = '<pre><code>plain code without language</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'plain code without language',
          language: undefined,
        },
      ]);
    });

    test('should parse multiline code block', () => {
      const content = `<pre><code class="language-javascript">function test() {
  console.log("multiline");
  return true;
}</code></pre>`;
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: `function test() {
  console.log("multiline");
  return true;
}`,
          language: 'javascript',
        },
      ]);
    });

    test('should handle code block with extra attributes', () => {
      const content =
        '<pre><code class="language-typescript" data-language="typescript" id="code1" style="color: red;">const x = 5;</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'const x = 5;',
          language: 'typescript',
        },
      ]);
    });
  });

  describe('List blocks', () => {
    test('should parse simple unordered list', () => {
      const content = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'list',
          content: '<ul><li>Item 1</li><li>Item 2</li></ul>',
        },
      ]);
    });

    test('should parse multiline list', () => {
      const content = `<ul>
<li>First item</li>
<li>Second item</li>
<li>Third item</li>
</ul>`;
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'list',
          content: `<ul>
<li>First item</li>
<li>Second item</li>
<li>Third item</li>
</ul>`,
        },
      ]);
    });

    test('should parse list with formatted content', () => {
      const content =
        '<ul><li><strong>Bold item</strong></li><li><em>Italic item</em></li></ul>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'list',
          content:
            '<ul><li><strong>Bold item</strong></li><li><em>Italic item</em></li></ul>',
        },
      ]);
    });
  });

  describe('Mixed content', () => {
    test('should parse text followed by code block', () => {
      const content = `Introduction text
<pre><code class="language-javascript">console.log("code");</code></pre>`;
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        { type: 'text', content: 'Introduction text' },
        {
          type: 'code',
          content: 'console.log("code");',
          language: 'javascript',
        },
      ]);
    });

    test('should parse code block followed by text', () => {
      const content = `<pre><code class="language-python">print("hello")</code></pre>
Explanation text`;
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'print("hello")',
          language: 'python',
        },
        { type: 'text', content: 'Explanation text' },
      ]);
    });

    test('should parse text, code, and list together', () => {
      const content = `Here is some text
<pre><code class="language-html" data-language="html">&lt;div&gt;HTML&lt;/div&gt;</code></pre>
And here is a list:
<ul><li>First</li><li>Second</li></ul>
Final text`;
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        { type: 'text', content: 'Here is some text' },
        {
          type: 'code',
          content: '<div>HTML</div>',
          language: 'html',
        },
        { type: 'text', content: 'And here is a list:' },
        {
          type: 'list',
          content: '<ul><li>First</li><li>Second</li></ul>',
        },
        { type: 'text', content: 'Final text' },
      ]);
    });

    test('should parse multiple code blocks with different languages', () => {
      const content = `<pre><code class="language-javascript">console.log("js");</code></pre>
Text between
<pre><code data-language="python">print("python")</code></pre>
More text
<pre><code class="language-css" data-language="css">body { color: red; }</code></pre>`;
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'console.log("js");',
          language: 'javascript',
        },
        { type: 'text', content: 'Text between' },
        {
          type: 'code',
          content: 'print("python")',
          language: 'python',
        },
        { type: 'text', content: 'More text' },
        {
          type: 'code',
          content: 'body { color: red; }',
          language: 'css',
        },
      ]);
    });
  });

  describe('Edge cases', () => {
    test('should handle empty content', () => {
      const content = '';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([]);
    });

    test('should handle whitespace-only content', () => {
      const content = '   \n\n  \t  \n   ';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([]);
    });

    test('should handle content with only code block', () => {
      const content =
        '<pre><code class="language-sql">SELECT * FROM users;</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'SELECT * FROM users;',
          language: 'sql',
        },
      ]);
    });

    test('should handle content with only list', () => {
      const content = '<ul><li>Only list item</li></ul>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'list',
          content: '<ul><li>Only list item</li></ul>',
        },
      ]);
    });

    test('should handle nested HTML in code content', () => {
      const content =
        '<pre><code class="language-html">&lt;div class="container"&gt;\n  &lt;p&gt;Nested content&lt;/p&gt;\n&lt;/div&gt;</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: `<div class="container">
  <p>Nested content</p>
</div>`,
          language: 'html',
        },
      ]);
    });

    test('should prioritize class attribute when both class and data-language differ', () => {
      const content =
        '<pre><code class="language-javascript" data-language="typescript">const x = 5;</code></pre>';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'const x = 5;',
          language: 'javascript', // class takes priority
        },
      ]);
    });
  });

  describe('Real-world server examples', () => {
    test('should parse server-generated flashcard with mixed content', () => {
      const content = `HTML provides three main list elements:

<ul>
<li><strong>&lt;ul&gt;</strong> - Creates an unordered (bulleted) list</li>
<li><strong>&lt;ol&gt;</strong> - Creates an ordered (numbered) list</li>
<li><strong>&lt;dl&gt;</strong> - Creates a description list with terms and definitions</li>
</ul>

Example of an unordered list:

<pre><code class="language-html" data-language="html">&lt;ul&gt;
  &lt;li&gt;First item&lt;/li&gt;
  &lt;li&gt;Second item&lt;/li&gt;
  &lt;li&gt;Third item&lt;/li&gt;
&lt;/ul&gt;</code></pre>

Each list type serves different purposes in semantic HTML structure.`;

      const result = parseContentIntoBlocks(content);

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        type: 'text',
        content: 'HTML provides three main list elements:',
      });
      expect(result[1].type).toBe('list');
      expect(result[2]).toEqual({
        type: 'text',
        content: 'Example of an unordered list:',
      });
      expect(result[3]).toEqual({
        type: 'code',
        content: `<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>`,
        language: 'html',
      });
      expect(result[4]).toEqual({
        type: 'text',
        content:
          'Each list type serves different purposes in semantic HTML structure.',
      });
    });
  });
});
