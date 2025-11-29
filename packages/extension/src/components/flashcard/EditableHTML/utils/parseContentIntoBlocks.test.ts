import { describe, test, expect } from 'vitest';
import { parseContentIntoBlocks, BlockType } from './parseContentIntoBlocks';

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
    test('should parse javascript code block', () => {
      const content = '```javascript\nconsole.log("test");\n```';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'console.log("test");',
          language: 'javascript',
        },
      ]);
    });

    test('should parse html code block', () => {
      const content = '```html\n<div>test</div>\n```';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: '<div>test</div>',
          language: 'html',
        },
      ]);
    });

    test('should parse python code block', () => {
      const content = '```python\nprint("hello")\n```';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'print("hello")',
          language: 'python',
        },
      ]);
    });

    test('should parse css code block', () => {
      const content = '```css\nbody { margin: 0; }\n```';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'code',
          content: 'body { margin: 0; }',
          language: 'css',
        },
      ]);
    });

    test('should parse nplain code', () => {
      const content = '```\nplain code without language\n```';
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
      const content =
        '```javascript\nfunction test() {\n  console.log("multiline");\n  return true;\n}\n```';
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
  });

  describe('List blocks', () => {
    test('should parse simple unordered list', () => {
      const content = '- Item 1\n- Item 2';
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'list',
          content: `- Item 1
- Item 2`,
        },
      ]);
    });

    test('should parse multiline list', () => {
      const content = `- First item
- Second item
- Third item`;
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'list',
          content: `- First item
- Second item
- Third item`,
        },
      ]);
    });

    test('should parse list with formatted content', () => {
      const content = `- **Bold item**
- *Italic item*`;
      const result = parseContentIntoBlocks(content);

      expect(result).toEqual([
        {
          type: 'list',
          content: `- **Bold item**
- *Italic item*`,
        },
      ]);
    });
  });

  describe('Mixed content', () => {
    test('should parse text followed by code block', () => {
      const content =
        'Introduction text\n```javascript\nconsole.log("code");\n```';
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
      const content = '```python\nprint("hello")\n```Explanation text';
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
      const content =
        'Here is some text\n```html\n<div>HTML</div>\n```\nAnd here is a list:\n- First\n- Second\nFinal text';

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
          content: `- First
- Second
`,
        },
        { type: 'text', content: 'Final text' },
      ]);
    });

    test('should parse multiple code blocks with different languages', () => {
      const content =
        '```javascript\nconsole.log("js");\n```\nText between\n```python\nprint("python")\n```\nMore text\n```css\nbody { color: red; }\n```';
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

  describe('Real-world server examples', () => {
    test('should parse server-generated flashcard with mixed content', () => {
      const content =
        'HTML provides three main list elements:\n- **&lt;ul&gt;** - Creates an unordered (bulleted) list\n- **&lt;ol&gt;** - Creates an ordered (numbered) list\n- **&lt;dl&gt;** - Creates a description list with terms and definitions\nExample of an unordered list:\n```html\n&lt;ul&gt;\n&lt;li&gt;First item&lt;/li&gt;\n&lt;li&gt;Second item&lt;/li&gt;\n&lt;li&gt;Third item&lt;/li&gt;\n&lt;/ul&gt;\n```\nEach list type serves different purposes in semantic HTML structure.';

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
        content: `&lt;ul&gt;
&lt;li&gt;First item&lt;/li&gt;
&lt;li&gt;Second item&lt;/li&gt;
&lt;li&gt;Third item&lt;/li&gt;
&lt;/ul&gt;`,
        language: 'html',
      });
      expect(result[4]).toEqual({
        type: 'text',
        content:
          'Each list type serves different purposes in semantic HTML structure.',
      });
    });

    test('should parse Angular CLI answer with multiple code blocks in lists', () => {
      const content = `**Angular CLI** is a command-line interface tool that helps create, build, and manage Angular applications.

To install it globally using **pnpm**:
\`\`\`bash
pnpm install -g @angular/cli
\`\`\`

- **Create a new project:**
  \`\`\`bash
  ng new project-name
  \`\`\`
- **Serve your application locally:**
  \`\`\`bash
  ng serve
  \`\`\`
- **Build the project for production:**
  \`\`\`bash
  ng build
  \`\`\`
- **Generate new components or services:**
  \`\`\`bash
  ng generate component component-name
  ng generate service service-name
  \`\`\``;

      const result = parseContentIntoBlocks(content);

      console.log('Total blocks found:', result.length);
      console.log('Blocks:', JSON.stringify(result, null, 2));

      // Count block types
      const codeBlocks = result.filter((b) => b.type === BlockType.Code);
      const listBlocks = result.filter((b) => b.type === BlockType.List);
      const textBlocks = result.filter((b) => b.type === BlockType.Text);

      console.log('Code blocks:', codeBlocks.length);
      console.log('List blocks:', listBlocks.length);
      console.log('Text blocks:', textBlocks.length);

      // We expect to find 5 code blocks total (1 standalone + 4 in lists)
      expect(codeBlocks.length).toBe(5);
    });
  });
});
