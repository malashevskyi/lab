/**
 * Tests for Udemy Site Modifier
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { udemyModifier } from './index';

describe('udemyModifier', () => {
  describe('matches', () => {
    it('should match valid Udemy course URLs', () => {
      expect(
        udemyModifier.matches('https://www.udemy.com/course/react-course/')
      ).toBe(true);
      expect(
        udemyModifier.matches(
          'https://www.udemy.com/course/javascript-basics/learn/lecture/12345'
        )
      ).toBe(true);
    });

    it('should not match non-Udemy URLs', () => {
      expect(udemyModifier.matches('https://www.google.com')).toBe(false);
      expect(udemyModifier.matches('https://www.coursera.org/learn/ml')).toBe(
        false
      );
    });

    it('should not match Udemy URLs that are not course pages', () => {
      expect(udemyModifier.matches('https://www.udemy.com/')).toBe(false);
      expect(udemyModifier.matches('https://www.udemy.com/about')).toBe(false);
    });

    it('should handle invalid URLs gracefully', () => {
      expect(udemyModifier.matches('not-a-url')).toBe(false);
      expect(udemyModifier.matches('')).toBe(false);
    });
  });

  describe('properties', () => {
    it('should have correct id', () => {
      expect(udemyModifier.id).toBe('udemy');
    });

    it('should have correct name', () => {
      expect(udemyModifier.name).toBe('Udemy');
    });

    it('should have initialize function', () => {
      expect(typeof udemyModifier.initialize).toBe('function');
    });

    it('should have cleanup function', () => {
      expect(typeof udemyModifier.cleanup).toBe('function');
    });
  });

  describe('initialize', () => {
    beforeEach(() => {
      // Reset DOM
      document.head.innerHTML = '';
      document.body.innerHTML = '';
    });

    afterEach(() => {
      // Clean up after each test
      if (udemyModifier.cleanup) {
        udemyModifier.cleanup();
      }
    });

    it('should inject styles into document head', () => {
      udemyModifier.initialize();

      const styleElement = document.getElementById('deepread-udemy-modifier');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
    });

    it('should not inject duplicate styles', () => {
      udemyModifier.initialize();

      // Verify first injection
      let styleElements = document.querySelectorAll('#deepread-udemy-modifier');
      expect(styleElements.length).toBe(1);

      udemyModifier.initialize();

      // Should still be only one element
      styleElements = document.querySelectorAll('#deepread-udemy-modifier');
      expect(styleElements.length).toBe(1);
    });

    it('should disable clicks on transcript cues', () => {
      // Setup transcript DOM
      document.body.innerHTML = `
        <div data-purpose="transcript-panel">
          <div class="transcript--cue-container--Vuwj6">
            <p data-purpose="transcript-cue" role="button" tabindex="0">
              <span data-purpose="cue-text">Test text</span>
            </p>
          </div>
        </div>
      `;

      udemyModifier.initialize();

      const cue = document.querySelector('[data-purpose="transcript-cue"]');

      // Verify that the cue has been processed
      expect(cue?.getAttribute('data-deepread-processed')).toBe('true');
      expect(cue?.getAttribute('tabindex')).toBe('-1');
      expect(cue?.hasAttribute('role')).toBe(false);

      // Test clicks on the content wrapper (should be prevented)
      const contentWrapper = cue?.querySelector('.deepread-transcript-content');
      expect(contentWrapper).not.toBeNull();

      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      });
      contentWrapper?.dispatchEvent(clickEvent);

      // Click on content should be prevented
      expect(clickEvent.defaultPrevented).toBe(true);
    });

    it('should not process transcript cues multiple times', () => {
      // Setup transcript DOM
      document.body.innerHTML = `
        <div data-purpose="transcript-panel">
          <div class="transcript--cue-container--Vuwj6">
            <p data-purpose="transcript-cue" role="button" tabindex="0">
              <span data-purpose="cue-text">Test text</span>
            </p>
          </div>
        </div>
      `;

      udemyModifier.initialize();
      const cue = document.querySelector('[data-purpose="transcript-cue"]');

      // First processing
      expect(cue?.getAttribute('data-deepread-processed')).toBe('true');

      // Call initialize again
      udemyModifier.initialize();

      // Should still have only one marker
      expect(cue?.getAttribute('data-deepread-processed')).toBe('true');
    });

    it('should add seek button to transcript cues', () => {
      // Setup transcript DOM
      document.body.innerHTML = `
        <div data-purpose="transcript-panel">
          <div class="transcript--cue-container--Vuwj6">
            <p data-purpose="transcript-cue" role="button" tabindex="0">
              <span data-purpose="cue-text">Test text</span>
            </p>
          </div>
        </div>
      `;

      udemyModifier.initialize();

      // Check if seek button was added
      const seekButton = document.querySelector('.deepread-seek-button');
      expect(seekButton).not.toBeNull();
      expect(seekButton?.tagName).toBe('BUTTON');
      expect(seekButton?.querySelector('svg')).not.toBeNull();
    });

    it('should wrap transcript content in proper structure', () => {
      // Setup transcript DOM
      document.body.innerHTML = `
        <div data-purpose="transcript-panel">
          <div class="transcript--cue-container--Vuwj6">
            <p data-purpose="transcript-cue" role="button" tabindex="0">
              <span data-purpose="cue-text">Test text</span>
            </p>
          </div>
        </div>
      `;

      udemyModifier.initialize();

      const cue = document.querySelector('[data-purpose="transcript-cue"]');

      // Check structure: cue > wrapper > [button, content]
      const wrapper = cue?.querySelector('.deepread-seek-button-container');
      expect(wrapper).not.toBeNull();

      const button = wrapper?.querySelector('.deepread-seek-button');
      expect(button).not.toBeNull();

      const content = wrapper?.querySelector('.deepread-transcript-content');
      expect(content).not.toBeNull();

      // Original text should be in content wrapper
      expect(content?.textContent).toContain('Test text');
    });

    it('should not add duplicate seek buttons', () => {
      // Setup transcript DOM
      document.body.innerHTML = `
        <div data-purpose="transcript-panel">
          <div class="transcript--cue-container--Vuwj6">
            <p data-purpose="transcript-cue" role="button" tabindex="0">
              <span data-purpose="cue-text">Test text</span>
            </p>
          </div>
        </div>
      `;

      udemyModifier.initialize();
      udemyModifier.initialize();

      // Should have only one seek button
      const seekButtons = document.querySelectorAll('.deepread-seek-button');
      expect(seekButtons.length).toBe(1);
    });
  });

  describe('cleanup', () => {
    beforeEach(() => {
      document.head.innerHTML = '';
      document.body.innerHTML = '';
    });

    afterEach(() => {
      if (udemyModifier.cleanup) {
        udemyModifier.cleanup();
      }
      // Clean up DOM after each test
      document.head.innerHTML = '';
      document.body.innerHTML = '';
    });

    it('should remove injected styles', () => {
      udemyModifier.initialize();

      expect(document.getElementById('deepread-udemy-modifier')).not.toBeNull();

      if (udemyModifier.cleanup) {
        udemyModifier.cleanup();
      }

      expect(document.getElementById('deepread-udemy-modifier')).toBeNull();
    });
  });
});
