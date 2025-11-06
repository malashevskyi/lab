import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { EditableHTML } from './index';

describe('EditableHTML', () => {
  const defaultProps = {
    content: '',
    onContentChange: vi.fn(),
    className: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Simple text content', () => {
    test('renders simple text content without blocks', () => {
      const content = 'Simple text content';
      render(<EditableHTML {...defaultProps} content={content} />);

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    test('calls onContentChange only when content actually changes', async () => {
      const onContentChange = vi.fn();
      const content = 'Simple text content';

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Click to edit
      const textElement = screen.getByText('Simple text content');
      await userEvent.click(textElement);

      const textarea = screen.getByDisplayValue('Simple text content');

      // Exit without changes
      fireEvent.blur(textarea);

      // Should not call onContentChange if content didn't change
      expect(onContentChange).toHaveBeenCalledTimes(0);
    });

    test('calls onContentChange when content actually changes', async () => {
      const onContentChange = vi.fn();
      const content = 'Simple text content';

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Click to edit
      const textElement = screen.getByText('Simple text content');
      await userEvent.click(textElement);

      const textarea = screen.getByDisplayValue('Simple text content');

      // Change content
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Modified content');

      // Exit
      fireEvent.blur(textarea);

      // Should call onContentChange with exactly what mock returns
      expect(onContentChange).toHaveBeenCalledWith('Modified content');
    });
  });

  describe('Text blocks', () => {
    test('renders multiple text blocks separated by newlines', () => {
      const content = 'Block 1\nBlock 2\nBlock 3';
      render(<EditableHTML {...defaultProps} content={content} />);

      expect(screen.getByText('Block 1')).toBeInTheDocument();
      expect(screen.getByText('Block 2')).toBeInTheDocument();
      expect(screen.getByText('Block 3')).toBeInTheDocument();
    });

    test('does not trigger onContentChange when text block content unchanged', async () => {
      const content = 'Block 1\nBlock 2';
      const onContentChange = vi.fn();

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Click on second block
      const block2 = screen.getByText('Block 2');
      await userEvent.click(block2);

      const textarea = screen.getByDisplayValue('Block 2');

      // Exit without real changes
      fireEvent.blur(textarea);

      // Should not call onContentChange due to normalization
      expect(onContentChange).toHaveBeenCalledTimes(0);
    });

    test('triggers onContentChange when text block content actually changes', async () => {
      const content = 'Block 1\nBlock 2';
      const onContentChange = vi.fn();

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Click on second block
      const block2 = screen.getByText('Block 2');
      await userEvent.click(block2);

      const textarea = screen.getByDisplayValue('Block 2');

      // Change content
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Modified Block 2');

      // Exit
      fireEvent.blur(textarea);

      // Should call onContentChange
      expect(onContentChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('List blocks', () => {
    test('renders list blocks correctly', () => {
      const content = '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>';
      render(<EditableHTML {...defaultProps} content={content} />);

      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });

    test('can edit list blocks', async () => {
      const content = '<ul><li>Item 1</li><li>Item 2</li></ul>';

      render(<EditableHTML {...defaultProps} content={content} />);

      // Click on list to edit
      const listElement = screen.getByText('Item 1').closest('div');
      await userEvent.click(listElement!);

      // Should show textarea with markdown format
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('- Item 1\n- Item 2');
    });

    test('does not trigger onContentChange when list content unchanged', async () => {
      const content = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const onContentChange = vi.fn();

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Click on list to edit
      const listElement = screen.getByText('Item 1').closest('div');
      await userEvent.click(listElement!);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('- Item 1\n- Item 2');

      // Exit without changes
      fireEvent.blur(textarea);

      // Should not call onContentChange due to normalization
      expect(onContentChange).toHaveBeenCalledTimes(0);
    });

    test('triggers onContentChange when list content actually changes', async () => {
      const content = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const onContentChange = vi.fn();

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Click on list to edit
      const listElement = screen.getByText('Item 1').closest('div');
      await userEvent.click(listElement!);

      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('- Item 1\n- Item 2');

      // Modify content
      await userEvent.clear(textarea);
      await userEvent.type(textarea, '- Modified Item 1\n- Modified Item 2');

      // Exit
      fireEvent.blur(textarea);

      // Should call onContentChange
      expect(onContentChange).toHaveBeenCalledTimes(1);
      expect(onContentChange).toHaveBeenCalledWith(
        '<ul><li>Modified Item 1</li><li>Modified Item 2</li></ul>'
      );
    });

    test('handles list with formatted content', async () => {
      const content =
        '<ul><li><strong>Bold item</strong></li><li><em>Italic item</em></li></ul>';

      render(<EditableHTML {...defaultProps} content={content} />);

      // Click on list to edit
      const listElement = screen.getByText('Bold item').closest('div');
      await userEvent.click(listElement!);

      // Should show markdown format with formatting
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveValue('- **Bold item**\n- *Italic item*');
    });
  });

  describe('Code blocks', () => {
    test('renders code blocks correctly', () => {
      const content =
        '<pre><code class="language-javascript">console.log("hello");</code></pre>';
      const { container } = render(
        <EditableHTML {...defaultProps} content={content} />
      );

      const codeEl = container.querySelector(
        '.code-block-container-class-for-text-detection'
      );
      expect(codeEl).toBeInTheDocument();
      expect(screen.getByText('console.log("hello");')).toBeInTheDocument();
    });
  });

  describe('Mixed content', () => {
    test('renders mixed content with text, lists, and code blocks', () => {
      const content = `Text block 1
<ul><li>List item 1</li><li>List item 2</li></ul>
Text block 2
<pre><code class="language-javascript">console.log("code");</code></pre>
Text block 3`;

      render(<EditableHTML {...defaultProps} content={content} />);

      expect(screen.getByText('Text block 1')).toBeInTheDocument();
      expect(screen.getByText('List item 1')).toBeInTheDocument();
      expect(screen.getByText('Text block 2')).toBeInTheDocument();
      expect(screen.getByText('console.log("code");')).toBeInTheDocument();
      expect(screen.getByText('Text block 3')).toBeInTheDocument();
    });

    test('can edit different types of blocks independently', async () => {
      const content = `Text block
<ul><li>List item</li></ul>`;
      const onContentChange = vi.fn();

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Edit text block
      const textBlock = screen.getByText('Text block');
      await userEvent.click(textBlock);

      let textarea = screen.getByDisplayValue('Text block');
      expect(textarea).toBeInTheDocument();

      // Exit text editing
      fireEvent.blur(textarea);

      // Edit list block
      const listElement = screen.getByText('List item').closest('div');
      await userEvent.click(listElement!);

      textarea = screen.getByDisplayValue('- List item');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Keyboard shortcuts', () => {
    test('exits edit mode with Shift+Enter', async () => {
      const content = 'Test content';
      const onContentChange = vi.fn();

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Enter edit mode
      const textElement = screen.getByText('Test content');
      await userEvent.click(textElement);

      const textarea = screen.getByDisplayValue('Test content');

      // Exit with Shift+Enter
      fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

      // Should exit edit mode, no textarea present
      expect(
        screen.queryByDisplayValue('Test content')
      ).not.toBeInTheDocument();
    });

    test('exits edit mode with Escape', async () => {
      const content = 'Test content';
      const onContentChange = vi.fn();

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Enter edit mode
      const textElement = screen.getByText('Test content');
      await userEvent.click(textElement);

      const textarea = screen.getByDisplayValue('Test content');

      // Exit with Escape
      fireEvent.keyDown(textarea, { key: 'Escape' });

      // Should exit edit mode, no textarea present
      expect(
        screen.queryByDisplayValue('Test content')
      ).not.toBeInTheDocument();
    });
  });

  describe('Block positioning and indexing', () => {
    test('maintains correct block indices when editing different positions', async () => {
      const content = `Block 0
<ul><li>List block 1</li></ul>
Block 2
<pre><code>Code block 3</code></pre>
Block 4`;
      const onContentChange = vi.fn();

      render(
        <EditableHTML
          {...defaultProps}
          content={content}
          onContentChange={onContentChange}
        />
      );

      // Edit block at position 2 (should be "Block 2")
      const block2 = screen.getByText('Block 2');
      await userEvent.click(block2);

      const textarea = screen.getByDisplayValue('Block 2');
      await userEvent.clear(textarea);
      await userEvent.type(textarea, 'Modified Block 2');

      fireEvent.blur(textarea);

      // Should call onContentChange with correctly positioned modification
      expect(onContentChange).toHaveBeenCalledTimes(1);

      // The modified content should maintain the structure
      const calledContent = onContentChange.mock.calls[0][0];
      expect(calledContent).toContain('Block 0');
      expect(calledContent).toContain('List block 1');
      expect(calledContent).toContain('Modified Block 2');
      expect(calledContent).toContain('Code block 3');
      expect(calledContent).toContain('Block 4');
    });
  });
});
