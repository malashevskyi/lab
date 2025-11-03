import type { GetLastFlashcardResponseType } from '@lab/types/deep-read/flashcards';
import React from 'react';
import DOMPurify from 'dompurify';
import { CodeBlock } from '../CodeBlock';

export interface LastFlashcardProps {
  flashcard?: GetLastFlashcardResponseType | null;
  isVisible: boolean;
}

// Component for inline code (simple gray background)
const InlineCode: React.FC<{ children: string }> = ({ children }) => (
  <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-sm font-mono">
    {children}
  </code>
);

// Enhanced component to safely render HTML content with proper code highlighting
const SafeHTMLRenderer: React.FC<{ html: string; className?: string }> = ({
  html,
  className = '',
}) => {
  const sanitizedHTML = DOMPurify.sanitize(html);

  // Parse the HTML to work with DOM elements
  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitizedHTML, 'text/html');

  const elements: React.ReactNode[] = [];
  let keyCounter = 0;

  // Function to process node and its children recursively
  const processNode = (node: Node): React.ReactNode[] => {
    const nodeElements: React.ReactNode[] = [];

    if (node.nodeType === Node.TEXT_NODE) {
      // Plain text node
      const text = node.textContent || '';
      if (text.trim()) {
        nodeElements.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;

      if (element.tagName === 'PRE' && element.querySelector('code')) {
        // Code block with syntax highlighting
        const codeElement = element.querySelector('code');
        if (codeElement) {
          const code = codeElement.textContent || '';
          const language =
            codeElement.getAttribute('data-language') ||
            codeElement.className.replace('language-', '') ||
            undefined;

          nodeElements.push(
            <CodeBlock key={keyCounter++} code={code} language={language} />
          );
        }
      } else if (
        element.tagName === 'CODE' &&
        element.parentElement?.tagName !== 'PRE'
      ) {
        // Inline code (not inside <pre>)
        const codeText = element.textContent || '';
        nodeElements.push(
          <InlineCode key={keyCounter++}>{codeText}</InlineCode>
        );
      } else {
        // Regular HTML element - process its children
        const childElements: React.ReactNode[] = [];

        Array.from(element.childNodes).forEach((child) => {
          childElements.push(...processNode(child));
        });

        if (childElements.length > 0) {
          // Recreate the element with processed children
          const props: any = { key: keyCounter++ };

          // Copy attributes
          Array.from(element.attributes).forEach((attr) => {
            if (attr.name === 'class') {
              props.className = attr.value;
            } else if (attr.name !== 'style') {
              // Skip style for security
              props[attr.name] = attr.value;
            }
          });

          const tagName = element.tagName.toLowerCase();
          nodeElements.push(
            React.createElement(tagName as any, props, ...childElements)
          );
        }
      }
    }

    return nodeElements;
  };

  // Process all child nodes of the body
  Array.from(doc.body.childNodes).forEach((node) => {
    elements.push(...processNode(node));
  });

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {elements.length > 0 ? (
        elements
      ) : (
        <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
      )}
    </div>
  );
};

export const LastFlashcard: React.FC<LastFlashcardProps> = ({
  flashcard,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="max-h-80 w-130 overflow-y-auto space-y-3 pr-2">
      <div className="mb-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Last Created Flashcard
        </h3>
        {flashcard ? (
          <div className="space-y-3">
            {/* Question Section */}
            <div className="bg-white p-3 rounded border-l-4 border-blue-400">
              <div className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">
                Question
              </div>
              <SafeHTMLRenderer
                html={flashcard.question}
                className="text-gray-800 leading-relaxed"
              />
            </div>

            {/* Answer Section */}
            <div className="bg-white p-3 rounded border-l-4 border-green-400">
              <div className="text-xs font-medium text-green-600 mb-2 uppercase tracking-wide">
                Answer
              </div>
              <SafeHTMLRenderer
                html={flashcard.answer}
                className="text-gray-800 leading-relaxed"
              />
            </div>

            {/* Metadata */}
            <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="space-x-2">
                <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                  Level: {flashcard.level}
                </span>
                {flashcard.tags.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    {flashcard.tags.join(', ')}
                  </span>
                )}
              </div>
              <span className="text-xs">
                {new Date(flashcard.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">
            <svg
              className="mx-auto h-8 w-8 text-gray-300 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="font-medium">No flashcard found</p>
            <p className="text-xs mt-1">
              Create your first flashcard to see it here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
