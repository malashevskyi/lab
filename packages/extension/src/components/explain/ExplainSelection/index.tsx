import React, { useEffect, useState } from 'react';
import { GeminiButton } from '../GeminiButton';
import { SearchGoogleButton } from '../SearchGoogleButton';
import { calculatePosition } from './calculatePosition';

export const ExplainSelection: React.FC = () => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [pageTitle, setPageTitle] = useState('');

  const showActionButton = (position: { x: number; y: number }) => {
    setButtonPosition(position);
    setIsButtonVisible(true);
  };

  const hideActionButton = () => {
    setIsButtonVisible(false);
    setButtonPosition({ x: 0, y: 0 });
    setSelectedText('');
    setPageTitle('');
  };

  const handleRegularSelection = (event: MouseEvent) => {
    if (event.target instanceof HTMLElement === false) return;
    // ignore if clicked inside the sidebar or existing UI
    if (event.target.closest('#deepread-root')) return;

    // ignore clicks on interactive elements like buttons, links, headings in accordions, etc.
    if (
      event.target.closest(
        'button, a, [role="button"], .heading, h1, h2, h3, h4, h5, h6'
      )
    )
      return;

    // ignore clicks on media elements (images, videos, etc.) and other non-text elements
    if (
      event.target.closest(
        'img, video, audio, canvas, svg, iframe, object, embed'
      )
    )
      return;

    // Handle only regular text selection (no modifier keys) for action button
    if (event.altKey || event.shiftKey || event.metaKey || event.ctrlKey)
      return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const selectionText = selection.toString().trim();

    // Don't show button if selection is empty or too short (likely from drag operations)
    if (!selectionText || selectionText.length <= 1) {
      hideActionButton();
      return;
    }

    handleUnexpectedSelection(selectionText);

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Get page title (h1 tag or document.title)
    const h1Element = document.querySelector('h1');

    const currentPageTitle = h1Element
      ? h1Element.textContent?.trim() || ''
      : document.title;

    // Calculate position ensuring it stays within viewport bounds
    const position = calculatePosition(rect);

    setSelectedText(selectionText);
    setPageTitle(currentPageTitle);
    showActionButton(position);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleRegularSelection);

    return () => {
      document.removeEventListener('mouseup', handleRegularSelection);
    };
  }, [handleRegularSelection]);

  const handleUnexpectedSelection = (selection: string) => {
    const unexpectedSelectionLength = selection.length <= 1;

    if (unexpectedSelectionLength) {
      hideActionButton();
    }
  };

  // Hide action button when clicking elsewhere or when selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const currentSelectedText = selection?.toString().trim();

      if (!currentSelectedText) {
        hideActionButton();
        return;
      }

      handleUnexpectedSelection(currentSelectedText);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof HTMLElement === false) return;
      // Don't hide if clicking on the action buttons container
      if (event.target.closest('[data-action-buttons-container]')) return;

      handleSelectionChange();
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [hideActionButton]);

  return (
    <>
      {isButtonVisible && (
        <div
          data-action-buttons-container
          className="action-buttons-container absolute z-[9999] bg-white border border-solid border-gray-300 rounded-lg shadow-lg p-2 hover:shadow-xl transition-shadow flex flex-col gap-2"
          style={{
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
          }}
        >
          <GeminiButton
            selectedText={selectedText}
            pageTitle={pageTitle}
            onHide={hideActionButton}
          />
          <SearchGoogleButton
            selectedText={selectedText}
            onHide={hideActionButton}
          />
        </div>
      )}
    </>
  );
};
