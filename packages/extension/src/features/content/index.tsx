import React from 'react';
import ReactDOM from 'react-dom/client';
import hostPageStyles from './hostPageStyles.css?inline';
import tailwindStyles from './index.css?inline';
import {
  injectHostStyles,
  injectShadowRootInlineStyles,
} from '../../utils/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ContentScriptRoot from './ContentScriptRoot';
import { ErrorBoundary } from '../../components/error/ErrorBoundary';
import sonnerStyles from 'sonner/dist/styles.css?inline';
import { Toaster } from 'sonner';
import { initializeSiteModifiers } from './site-modifiers';

console.log('[Assistant] Content script loaded!');

injectHostStyles(hostPageStyles, 'assistant-host-styles');

// Initialize site-specific modifications (e.g., Udemy transcript fixes)
initializeSiteModifiers();

const rootElement = document.createElement('div');
rootElement.id = 'assistant-root';
document.body.appendChild(rootElement);

export const shadowRoot = rootElement.attachShadow({ mode: 'open' });

injectShadowRootInlineStyles(shadowRoot, sonnerStyles, 'sonner-styles');
injectShadowRootInlineStyles(shadowRoot, tailwindStyles, 'tailwind-styles');

const queryClient = new QueryClient();

const reactRoot = ReactDOM.createRoot(shadowRoot);

reactRoot.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Toaster richColors position="bottom-center" />
        <ContentScriptRoot />
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>
);
