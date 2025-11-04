import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { LastFlashcard } from './index';
import type { GetLastFlashcardResponseType } from '@lab/types/deep-read/flashcards';

// Mock the CodeBlock component since we're testing the rendering logic
vi.mock('../CodeBlock', () => ({
  CodeBlock: ({ code, language }: { code: string; language?: string }) => (
    <div data-testid="code-block" data-language={language || ''}>
      {code}
    </div>
  ),
}));

describe('LastFlashcard SafeHTMLRenderer', () => {
  const createMockFlashcard = (
    answer: string
  ): GetLastFlashcardResponseType => ({
    id: 'test-1',
    question: 'Test question',
    answer,
    sourceUrl: 'test-url',
    level: 'middle',
    tags: ['test'],
    context: 'React',
    lastInterval: null,
    nextReviewDate: null,
    contexts: ['general-knowledge'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('should render regular HTML without code blocks', () => {
    const flashcard = createMockFlashcard(`
      <p>This is regular text with <strong>bold</strong> and <em>italic</em>.</p>
      <ul><li>Item 1</li><li>Item 2</li></ul>
    `);

    render(<LastFlashcard flashcard={flashcard} isVisible={true} />);

    expect(screen.getByText(/This is regular text/)).toBeInTheDocument();
    expect(screen.getByText('bold')).toBeInTheDocument();
    expect(screen.getByText('italic')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.queryByTestId('code-block')).not.toBeInTheDocument();
  });

  it('should render inline code with gray background (not using CodeBlock)', () => {
    const flashcard = createMockFlashcard(`
      <p>Use <code>useState</code> for state and <code>useEffect</code> for side effects.</p>
    `);

    render(<LastFlashcard flashcard={flashcard} isVisible={true} />);

    // Should find inline code elements
    const useStateCode = screen.getByText('useState');
    const useEffectCode = screen.getByText('useEffect');

    // Check that these are rendered as inline code (not CodeBlock components)
    expect(useStateCode).toBeInTheDocument();
    expect(useEffectCode).toBeInTheDocument();
    expect(useStateCode.tagName).toBe('CODE');
    expect(useEffectCode.tagName).toBe('CODE');

    // Should have gray background styling
    expect(useStateCode).toHaveClass('bg-gray-100', 'text-gray-800');
    expect(useEffectCode).toHaveClass('bg-gray-100', 'text-gray-800');

    // Should NOT use CodeBlock component for inline code
    expect(screen.queryByTestId('code-block')).not.toBeInTheDocument();
  });

  it('should render single pre/code block using CodeBlock component', () => {
    const flashcard = createMockFlashcard(`
      <p>Here's a JavaScript example:</p>
      <pre><code class="language-javascript">async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}</code></pre>
      <p>That's the function.</p>
    `);

    render(<LastFlashcard flashcard={flashcard} isVisible={true} />);

    expect(screen.getByText(/Here's a JavaScript example/)).toBeInTheDocument();
    expect(screen.getByText(/That's the function/)).toBeInTheDocument();

    // Should render CodeBlock component
    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveAttribute('data-language', 'javascript');
    expect(codeBlock).toHaveTextContent('async function fetchData()');
  });

  it('should render multiple pre/code blocks sequentially', () => {
    const flashcard = createMockFlashcard(`
      <pre><code class="language-javascript">const first = 'First block';</code></pre>
      <pre><code class="language-typescript">const second: string = 'Second block';</code></pre>
      <pre><code class="language-css">.third { color: blue; }</code></pre>
    `);

    render(<LastFlashcard flashcard={flashcard} isVisible={true} />);

    const codeBlocks = screen.getAllByTestId('code-block');
    expect(codeBlocks).toHaveLength(3);

    expect(codeBlocks[0]).toHaveAttribute('data-language', 'javascript');
    expect(codeBlocks[0]).toHaveTextContent("const first = 'First block';");

    expect(codeBlocks[1]).toHaveAttribute('data-language', 'typescript');
    expect(codeBlocks[1]).toHaveTextContent(
      "const second: string = 'Second block';"
    );

    expect(codeBlocks[2]).toHaveAttribute('data-language', 'css');
    expect(codeBlocks[2]).toHaveTextContent('.third { color: blue; }');
  });

  it('should handle mixed content: text + pre/code blocks + inline code', () => {
    const flashcard = createMockFlashcard(`
      <h3>Component Setup</h3>
      <p>First, import <code>React</code> and <code>useState</code>:</p>
      <pre><code class="language-jsx">import React, { useState } from 'react';

function MyComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}</code></pre>
      <p>Then use <code>setCount</code> to update the state.</p>
      <h3>Event Handling</h3>
      <pre><code class="language-javascript">const handleClick = () => {
  setCount(prevCount => prevCount + 1);
};</code></pre>
      <p>Remember: always use <code>prevCount</code> pattern.</p>
    `);

    render(<LastFlashcard flashcard={flashcard} isVisible={true} />);

    // Should render headings and text
    expect(screen.getByText('Component Setup')).toBeInTheDocument();
    expect(screen.getByText('Event Handling')).toBeInTheDocument();
    expect(screen.getByText(/First, import/)).toBeInTheDocument();
    expect(screen.getByText(/Then use/)).toBeInTheDocument();

    // Should render inline code elements
    const reactCode = screen.getByText('React');
    const useStateCode = screen.getByText('useState');
    const setCountCode = screen.getByText('setCount');
    const prevCountCode = screen.getByText('prevCount');

    expect(reactCode.tagName).toBe('CODE');
    expect(useStateCode.tagName).toBe('CODE');
    expect(setCountCode.tagName).toBe('CODE');
    expect(prevCountCode.tagName).toBe('CODE');

    // Should render CodeBlock components for pre/code blocks
    const codeBlocks = screen.getAllByTestId('code-block');
    expect(codeBlocks).toHaveLength(2);

    expect(codeBlocks[0]).toHaveAttribute('data-language', 'jsx');
    expect(codeBlocks[0]).toHaveTextContent('import React, { useState }');

    expect(codeBlocks[1]).toHaveAttribute('data-language', 'javascript');
    expect(codeBlocks[1]).toHaveTextContent('const handleClick = () =>');
  });

  it('should handle code blocks with data-language attribute', () => {
    const flashcard = createMockFlashcard(`
      <pre><code data-language="python">def hello():
    print("Hello, World!")
    return True</code></pre>
    `);

    render(<LastFlashcard flashcard={flashcard} isVisible={true} />);

    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toHaveAttribute('data-language', 'python');
    expect(codeBlock).toHaveTextContent('def hello():');
  });

  it('should handle code blocks without language specification', () => {
    const flashcard = createMockFlashcard(`
      <pre><code>console.log("No language specified");</code></pre>
    `);

    render(<LastFlashcard flashcard={flashcard} isVisible={true} />);

    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toHaveAttribute('data-language', '');
    expect(codeBlock).toHaveTextContent(
      'console.log("No language specified");'
    );
  });

  it('should not render when isVisible is false', () => {
    const flashcard = createMockFlashcard('<p>Test content</p>');

    render(<LastFlashcard flashcard={flashcard} isVisible={false} />);

    expect(screen.queryByText('Test content')).not.toBeInTheDocument();
  });

  it('should render "No flashcard found" when flashcard is null', () => {
    render(<LastFlashcard flashcard={null} isVisible={true} />);

    expect(screen.getByText('No flashcard found')).toBeInTheDocument();
    expect(
      screen.getByText('Create your first flashcard to see it here')
    ).toBeInTheDocument();
  });

  it('should sanitize HTML and prevent XSS', () => {
    const flashcard = createMockFlashcard(`
      <p>Safe content</p>
      <script>alert('xss')</script>
      <img src="x" onerror="alert('xss')">
    `);

    render(<LastFlashcard flashcard={flashcard} isVisible={true} />);

    expect(screen.getByText('Safe content')).toBeInTheDocument();
    // Script tags should be removed by DOMPurify
    expect(screen.queryByText(/alert/)).not.toBeInTheDocument();
  });
});
