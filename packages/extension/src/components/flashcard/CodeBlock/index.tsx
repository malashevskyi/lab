import React, { useEffect } from 'react';
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

  const isLanguageSupported = languages[normalizedLanguage];
  const highlightLanguage = isLanguageSupported
    ? normalizedLanguage
    : 'javascript';

  useEffect(() => {
    const shadowRoot = document.querySelector('#deepread-root')?.shadowRoot;

    if (shadowRoot) {
      injectShadowRootInlineStyles(shadowRoot, prismTheme, 'code-block-theme');
    }
  }, []);

  return (
    <div
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
        value={code}
        onValueChange={editable && onCodeChange ? onCodeChange : () => {}}
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
