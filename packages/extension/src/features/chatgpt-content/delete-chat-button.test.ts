/**
 * Tests for ChatGPT delete chat button functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { insertDeleteButton } from './delete-chat-button';

describe('ChatGPT Delete Chat Button', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('insertDeleteButton', () => {
    it('should insert delete button in sidebar chat item', () => {
      document.body.innerHTML = `
        <a data-sidebar-item="true" href="/c/test-123">
          <div class="trailing-pair">
            <div class="trailing highlight">
              <button data-testid="history-item-0-options"></button>
            </div>
          </div>
        </a>
      `;

      const chatLink = document.querySelector('a') as HTMLAnchorElement;
      insertDeleteButton(chatLink);

      const deleteButton = document.querySelector(
        '.assistant-chatgpt-delete-button'
      );
      expect(deleteButton).toBeTruthy();
      expect(deleteButton?.getAttribute('aria-label')).toBe('Delete chat');
    });

    it('should not insert duplicate button', () => {
      document.body.innerHTML = `
        <a data-sidebar-item="true" href="/c/test-123">
          <div class="trailing-pair">
            <div class="trailing highlight">
              <button data-testid="history-item-0-options"></button>
            </div>
          </div>
        </a>
      `;

      const chatLink = document.querySelector('a') as HTMLAnchorElement;

      insertDeleteButton(chatLink);
      const firstCount = document.querySelectorAll(
        '.assistant-chatgpt-delete-button'
      ).length;
      expect(firstCount).toBe(1);

      insertDeleteButton(chatLink);
      const secondCount = document.querySelectorAll(
        '.assistant-chatgpt-delete-button'
      ).length;
      expect(secondCount).toBe(1);
    });

    it('should have correct icon', () => {
      document.body.innerHTML = `
        <a data-sidebar-item="true" href="/c/test-123">
          <div class="trailing-pair">
            <div class="trailing highlight">
              <button data-testid="history-item-0-options"></button>
            </div>
          </div>
        </a>
      `;

      const chatLink = document.querySelector('a') as HTMLAnchorElement;
      insertDeleteButton(chatLink);

      const deleteButton = document.querySelector(
        '.assistant-chatgpt-delete-button'
      ) as HTMLElement;
      expect(deleteButton).toBeTruthy();

      const svg = deleteButton.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('width')).toBe('20');
      expect(svg?.getAttribute('height')).toBe('20');

      const path = svg?.querySelector('path');
      expect(path).toBeTruthy();
    });

    it('should not insert if trailing highlight not found', () => {
      document.body.innerHTML = `
        <a data-sidebar-item="true" href="/c/test-123">
          <div class="trailing-pair">
          </div>
        </a>
      `;

      const chatLink = document.querySelector('a') as HTMLAnchorElement;
      insertDeleteButton(chatLink);

      const deleteButton = document.querySelector(
        '.assistant-chatgpt-delete-button'
      );
      expect(deleteButton).toBeFalsy();
    });

    it('should be inserted before options button', () => {
      document.body.innerHTML = `
        <a data-sidebar-item="true" href="/c/test-123">
          <div class="trailing-pair">
            <div class="trailing highlight">
              <button data-testid="history-item-0-options" class="options-btn"></button>
            </div>
          </div>
        </a>
      `;

      const chatLink = document.querySelector('a') as HTMLAnchorElement;
      insertDeleteButton(chatLink);

      const trailingHighlight = document.querySelector('.trailing.highlight');
      const children = Array.from(trailingHighlight?.children || []);

      expect(children.length).toBe(2);
      expect(
        children[0].classList.contains('assistant-chatgpt-delete-button')
      ).toBe(true);
      expect(children[1].classList.contains('options-btn')).toBe(true);
    });
  });
});
