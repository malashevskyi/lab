import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePreventHostKeyboardEvents } from './usePreventHostKeyboardEvents';

describe('usePreventHostKeyboardEvents', () => {
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not attach event listeners when popup is closed', () => {
    const popupRef = { current: document.createElement('div') };

    renderHook(() => usePreventHostKeyboardEvents(popupRef, false));

    // Check that our specific keyboard event listeners were not added
    const keyboardEvents = ['keydown', 'keyup', 'keypress'];
    const calls = addEventListenerSpy.mock.calls.filter((call) =>
      keyboardEvents.includes(call[0] as string)
    );
    expect(calls).toHaveLength(0);
  });

  it('should attach event listeners when popup is open', () => {
    const popupRef = { current: document.createElement('div') };

    renderHook(() => usePreventHostKeyboardEvents(popupRef, true));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { capture: true }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function),
      { capture: true }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keypress',
      expect.any(Function),
      { capture: true }
    );
  });

  it('should remove event listeners on cleanup when popup is open', () => {
    const popupRef = { current: document.createElement('div') };

    const { unmount } = renderHook(() =>
      usePreventHostKeyboardEvents(popupRef, true)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function),
      { capture: true }
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keyup',
      expect.any(Function),
      { capture: true }
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'keypress',
      expect.any(Function),
      { capture: true }
    );
  });

  it('should reattach listeners when isOpen changes from false to true', () => {
    const popupRef = { current: document.createElement('div') };

    const { rerender } = renderHook(
      ({ isOpen }) => usePreventHostKeyboardEvents(popupRef, isOpen),
      { initialProps: { isOpen: false } }
    );

    expect(addEventListenerSpy).not.toHaveBeenCalled();

    rerender({ isOpen: true });

    expect(addEventListenerSpy).toHaveBeenCalledTimes(3);
  });

  it('should remove listeners when isOpen changes from true to false', () => {
    const popupRef = { current: document.createElement('div') };

    const { rerender } = renderHook(
      ({ isOpen }) => usePreventHostKeyboardEvents(popupRef, isOpen),
      { initialProps: { isOpen: true } }
    );

    expect(addEventListenerSpy).toHaveBeenCalledTimes(3);

    rerender({ isOpen: false });

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);
  });

  it('should stop propagation for keyboard events in input elements within popup', () => {
    const popupDiv = document.createElement('div');
    const textarea = document.createElement('textarea');
    popupDiv.appendChild(textarea);

    const popupRef = { current: popupDiv };

    renderHook(() => usePreventHostKeyboardEvents(popupRef, true));

    // Get the handler that was registered
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'keydown'
    )?.[1] as EventListener;

    expect(keydownHandler).toBeDefined();

    // Create a keyboard event with composedPath (Space is in shortcut list)
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    const stopImmediatePropagationSpy = vi.spyOn(
      event,
      'stopImmediatePropagation'
    );

    // Mock composedPath to simulate Shadow DOM
    event.composedPath = () => [
      textarea,
      popupDiv,
      document.body,
      document.documentElement,
      document,
      window,
    ];

    keydownHandler(event);

    expect(stopImmediatePropagationSpy).toHaveBeenCalled();
  });

  it('should not stop propagation for keyboard events in non-input elements within popup', () => {
    const popupDiv = document.createElement('div');
    const regularDiv = document.createElement('div');
    popupDiv.appendChild(regularDiv);

    const popupRef = { current: popupDiv };

    renderHook(() => usePreventHostKeyboardEvents(popupRef, true));

    // Get the handler that was registered
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'keydown'
    )?.[1] as EventListener;

    expect(keydownHandler).toBeDefined();

    // Create a keyboard event with composedPath (not an input element)
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    const stopImmediatePropagationSpy = vi.spyOn(
      event,
      'stopImmediatePropagation'
    );

    // Mock composedPath to simulate Shadow DOM
    event.composedPath = () => [
      regularDiv,
      popupDiv,
      document.body,
      document.documentElement,
      document,
      window,
    ];

    keydownHandler(event);

    // Should NOT block because it's not an input element
    expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
  });

  it('should not stop propagation for keyboard events outside popup', () => {
    const popupDiv = document.createElement('div');
    const outsideInput = document.createElement('input');

    const popupRef = { current: popupDiv };

    renderHook(() => usePreventHostKeyboardEvents(popupRef, true));

    // Get the handler that was registered
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'keydown'
    )?.[1] as EventListener;

    expect(keydownHandler).toBeDefined();

    // Create a keyboard event with composedPath (outside popup)
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    const stopImmediatePropagationSpy = vi.spyOn(
      event,
      'stopImmediatePropagation'
    );

    // Mock composedPath - input is NOT inside popupDiv
    event.composedPath = () => [
      outsideInput,
      document.body,
      document.documentElement,
      document,
      window,
    ];

    keydownHandler(event);

    // Should NOT block because event is outside popup
    expect(stopImmediatePropagationSpy).not.toHaveBeenCalled();
  });

  it('should handle contenteditable elements', () => {
    const popupDiv = document.createElement('div');
    const contentEditableDiv = document.createElement('div');

    // Mock isContentEditable property since jsdom doesn't properly support it
    Object.defineProperty(contentEditableDiv, 'isContentEditable', {
      value: true,
      writable: false,
    });

    popupDiv.appendChild(contentEditableDiv);

    const popupRef = { current: popupDiv };

    renderHook(() => usePreventHostKeyboardEvents(popupRef, true));

    // Get the handler that was registered
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'keydown'
    )?.[1] as EventListener;

    expect(keydownHandler).toBeDefined();

    // Create a keyboard event with composedPath
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    const stopImmediatePropagationSpy = vi.spyOn(
      event,
      'stopImmediatePropagation'
    );

    // Mock composedPath to simulate Shadow DOM
    event.composedPath = () => [
      contentEditableDiv,
      popupDiv,
      document.body,
      document.documentElement,
      document,
      window,
    ];

    keydownHandler(event);

    expect(stopImmediatePropagationSpy).toHaveBeenCalled();
  });

  it('should prevent video shortcuts like F (fullscreen) and arrows (seek)', () => {
    const popupDiv = document.createElement('div');
    const input = document.createElement('input');
    popupDiv.appendChild(input);

    const popupRef = { current: popupDiv };

    renderHook(() => usePreventHostKeyboardEvents(popupRef, true));

    // Get the handler that was registered
    const keydownHandler = addEventListenerSpy.mock.calls.find(
      (call) => call[0] === 'keydown'
    )?.[1] as EventListener;

    expect(keydownHandler).toBeDefined();

    // Test F key (fullscreen) - should be blocked
    const fEvent = new KeyboardEvent('keydown', { key: 'f', bubbles: true });
    const fStopImmediatePropagationSpy = vi.spyOn(
      fEvent,
      'stopImmediatePropagation'
    );
    fEvent.composedPath = () => [
      input,
      popupDiv,
      document.body,
      document.documentElement,
      document,
      window,
    ];
    keydownHandler(fEvent);
    expect(fStopImmediatePropagationSpy).toHaveBeenCalled();

    // Test ArrowRight (seek forward) - should be blocked
    const arrowEvent = new KeyboardEvent('keydown', {
      key: 'ArrowRight',
      bubbles: true,
    });
    const arrowStopImmediatePropagationSpy = vi.spyOn(
      arrowEvent,
      'stopImmediatePropagation'
    );
    arrowEvent.composedPath = () => [
      input,
      popupDiv,
      document.body,
      document.documentElement,
      document,
      window,
    ];
    keydownHandler(arrowEvent);
    expect(arrowStopImmediatePropagationSpy).toHaveBeenCalled();
  });
});
