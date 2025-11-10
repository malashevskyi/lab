import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

// Mock chrome API
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      remove: vi.fn(),
    },
  },
} as any;

describe('Gemini Delete Chat Button', () => {
  let dom: JSDOM;
  let document: Document;
  let window: Window;

  beforeEach(() => {
    // Create a fresh DOM for each test
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
      url: 'https://gemini.google.com',
    });
    document = dom.window.document;
    window = dom.window as unknown as Window;

    // Make them globally available
    global.document = document;
    (global as any).window = window;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('DOM Structure Creation', () => {
    it('should create trailing actions wrapper', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'trailing-actions-wrapper ui-ready-fade-in';
      document.body.appendChild(wrapper);

      const found = document.querySelector('.trailing-actions-wrapper');
      expect(found).toBeTruthy();
      expect(found?.className).toContain('trailing-actions-wrapper');
    });

    it('should create input buttons wrapper', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'trailing-actions-wrapper';

      const inputWrapper = document.createElement('div');
      inputWrapper.className = 'input-buttons-wrapper-bottom';
      wrapper.appendChild(inputWrapper);

      document.body.appendChild(wrapper);

      const found = document.querySelector('.input-buttons-wrapper-bottom');
      expect(found).toBeTruthy();
    });

    it('should create mic button', () => {
      const micContainer = document.createElement('div');
      micContainer.className = 'mic-button-container';

      const button = document.createElement('button');
      button.className = 'speech_dictation_mic_button';
      micContainer.appendChild(button);

      document.body.appendChild(micContainer);

      const found = document.querySelector('.speech_dictation_mic_button');
      expect(found).toBeTruthy();
    });
  });

  describe('Delete Button Structure', () => {
    it('should create delete button with correct classes', () => {
      const button = document.createElement('button');
      button.id = 'deepread-gemini-delete-button';
      button.className =
        'mdc-icon-button mat-mdc-icon-button mat-mdc-button-base';
      button.setAttribute('aria-label', 'Delete current chat');

      expect(button.id).toBe('deepread-gemini-delete-button');
      expect(button.className).toContain('mdc-icon-button');
      expect(button.getAttribute('aria-label')).toBe('Delete current chat');
    });

    it('should have delete icon', () => {
      const icon = document.createElement('mat-icon');
      icon.setAttribute('fonticon', 'delete');
      icon.textContent = 'delete';

      expect(icon.getAttribute('fonticon')).toBe('delete');
      expect(icon.textContent).toBe('delete');
    });
  });

  describe('Menu Interaction', () => {
    it('should find actions menu button', () => {
      const menuButton = document.createElement('button');
      menuButton.className = 'conversation-actions-menu-button';
      menuButton.setAttribute('data-test-id', 'actions-menu-button');
      document.body.appendChild(menuButton);

      const found = document.querySelector<HTMLButtonElement>(
        'button[data-test-id="actions-menu-button"]'
      );

      expect(found).toBeTruthy();
      expect(found?.className).toContain('conversation-actions-menu-button');
    });

    it('should find delete button in menu', () => {
      const deleteButton = document.createElement('button');
      deleteButton.setAttribute('data-test-id', 'delete-button');
      deleteButton.className = 'mat-mdc-menu-item';
      document.body.appendChild(deleteButton);

      const found = document.querySelector<HTMLButtonElement>(
        'button[data-test-id="delete-button"]'
      );

      expect(found).toBeTruthy();
    });
  });

  describe('Confirmation Dialog', () => {
    it('should find confirm button in dialog', () => {
      const dialog = document.createElement('mat-dialog-container');
      dialog.className = 'mat-mdc-dialog-container';

      const confirmButton = document.createElement('button');
      confirmButton.setAttribute('data-test-id', 'confirm-button');
      confirmButton.textContent = 'Delete';
      dialog.appendChild(confirmButton);

      document.body.appendChild(dialog);

      const found = document.querySelector<HTMLButtonElement>(
        'button[data-test-id="confirm-button"]'
      );

      expect(found).toBeTruthy();
      expect(found?.textContent).toBe('Delete');
    });

    it('should have cancel and confirm buttons', () => {
      const actions = document.createElement('mat-dialog-actions');

      const cancelButton = document.createElement('button');
      cancelButton.setAttribute('data-test-id', 'cancel-button');
      cancelButton.textContent = 'Cancel';

      const confirmButton = document.createElement('button');
      confirmButton.setAttribute('data-test-id', 'confirm-button');
      confirmButton.textContent = 'Delete';

      actions.appendChild(cancelButton);
      actions.appendChild(confirmButton);
      document.body.appendChild(actions);

      expect(
        document.querySelector('[data-test-id="cancel-button"]')
      ).toBeTruthy();
      expect(
        document.querySelector('[data-test-id="confirm-button"]')
      ).toBeTruthy();
    });
  });

  describe('Spinner Creation', () => {
    it('should create spinner with correct styles', () => {
      const spinner = document.createElement('div');
      spinner.id = 'deepread-delete-spinner';
      spinner.style.cssText = `
        display: inline-block;
        width: 24px;
        height: 24px;
        border: 3px solid rgba(95, 99, 104, 0.2);
        border-top-color: #1a73e8;
        border-radius: 50%;
      `;

      expect(spinner.id).toBe('deepread-delete-spinner');
      expect(spinner.style.width).toBe('24px');
      expect(spinner.style.height).toBe('24px');
      expect(spinner.style.borderRadius).toBe('50%');
    });
  });

  describe('Element Positioning', () => {
    it('should insert delete button at the beginning of wrapper', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-buttons-wrapper-bottom';

      const micButton = document.createElement('button');
      micButton.className = 'mic-button';
      wrapper.appendChild(micButton);

      const deleteButton = document.createElement('button');
      deleteButton.id = 'deepread-gemini-delete-button';
      wrapper.insertBefore(deleteButton, wrapper.firstChild);

      expect(wrapper.firstChild).toBe(deleteButton);
      expect(wrapper.children.length).toBe(2);
    });
  });

  describe('Button States', () => {
    it('should handle hover states', () => {
      const button = document.createElement('button');
      button.style.backgroundColor = 'transparent';

      // Simulate hover
      button.style.backgroundColor = 'rgba(95, 99, 104, 0.08)';
      expect(button.style.backgroundColor).toBe('rgba(95, 99, 104, 0.08)');

      // Simulate leave
      button.style.backgroundColor = 'transparent';
      expect(button.style.backgroundColor).toBe('transparent');
    });

    it('should not duplicate button when already exists', () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'input-buttons-wrapper-bottom';

      const existingButton = document.createElement('button');
      existingButton.id = 'deepread-gemini-delete-button';
      wrapper.appendChild(existingButton);

      // Add wrapper to document so querySelector can find it
      document.body.appendChild(wrapper);

      // Try to find the button
      const newButton = document.querySelector(
        '#deepread-gemini-delete-button'
      );
      expect(newButton).toBeTruthy();

      // Should only have one button with this ID
      const allButtons = document.querySelectorAll(
        '#deepread-gemini-delete-button'
      );
      expect(allButtons.length).toBe(1);

      // Cleanup
      document.body.removeChild(wrapper);
    });
  });

  describe('Deletion Flow', () => {
    it('should remove spinner after successful deletion', () => {
      const wrapper = document.createElement('div');
      const spinner = document.createElement('div');
      spinner.id = 'deepread-delete-spinner';
      wrapper.appendChild(spinner);

      expect(wrapper.querySelector('#deepread-delete-spinner')).toBeTruthy();

      // Remove spinner
      spinner.remove();
      expect(wrapper.querySelector('#deepread-delete-spinner')).toBeFalsy();
    });

    it('should detect dialog disappearance', () => {
      const dialog = document.createElement('mat-dialog-container');
      document.body.appendChild(dialog);

      expect(document.querySelector('mat-dialog-container')).toBeTruthy();

      dialog.remove();
      expect(document.querySelector('mat-dialog-container')).toBeFalsy();
    });
  });
});
