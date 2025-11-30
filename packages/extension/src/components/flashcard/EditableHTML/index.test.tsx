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
