import React, { useEffect, useState, useRef } from 'react';
import { highlight, languages } from 'prismjs';
import Editor from 'react-simple-code-editor';

// language components
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-python';

import prismTheme from './index.css?inline';
import { injectShadowRootInlineStyles } from '../../../utils/styles';
import { normalizeLanguage } from './normalizeLanguage';

interface CodeBlockProps {
  code: string;
  language?: string;
  editable?: boolean;
  onCodeChange?: (newCode: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  editable = false,
  onCodeChange,
}) => {
  const normalizedLanguage = normalizeLanguage(language);
  const [localCode, setLocalCode] = useState(code);
  const editorRef = useRef<HTMLDivElement>(null);

  const isLanguageSupported = languages[normalizedLanguage];
  const highlightLanguage = isLanguageSupported
    ? normalizedLanguage
    : 'javascript';

  useEffect(() => {
    const shadowRoot = document.querySelector('#assistant-root')?.shadowRoot;

    if (shadowRoot) {
      injectShadowRootInlineStyles(shadowRoot, prismTheme, 'code-block-theme');
    }
  }, []);

  // Update local state when code prop changes from parent
  useEffect(() => {
    setLocalCode(code);
  }, [code]);

  const handleBlur = () => {
    // Only save if content actually changed
    if (editable && onCodeChange && localCode !== code) {
      onCodeChange(localCode);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Shift+Enter or Escape
    if ((e.key === 'Enter' && e.shiftKey) || e.key === 'Escape') {
      e.preventDefault();
      if (editable && onCodeChange && localCode !== code) {
        onCodeChange(localCode);
      }
      // Remove focus from editor
      if (editorRef.current) {
        editorRef.current.blur();
      }
    }
  };

  return (
    <div
      ref={editorRef}
      style={{
        padding: 1,
        fontFamily: 'monospace',
        position: 'relative',
        backgroundColor: '#282c34',
        color: '#abb2bf',
        border: '1px solid #374151',
        borderRadius: '6px',
        overflow: 'hidden',
        margin: '8px 0',
      }}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {/* Language label */}
      {language && (
        <div
          style={{
            backgroundColor: '#21252b',
            color: '#abb2bf',
            padding: '4px 12px',
            fontSize: '12px',
            borderBottom: '1px solid #4a5568',
            fontFamily: 'monospace',
          }}
        >
          {language}
        </div>
      )}

      <Editor
        value={localCode}
        onValueChange={editable ? setLocalCode : () => {}}
        highlight={(code) =>
          highlight(code, languages[highlightLanguage], highlightLanguage)
        }
        padding={10}
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: '14px',
        }}
      />
    </div>
  );
};
