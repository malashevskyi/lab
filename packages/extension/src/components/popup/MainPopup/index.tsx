import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../../../store';
import { FlashcardCreator } from '../../flashcard/FlashcardCreator';
import { LastFlashcardTab } from '../../flashcard/LastFlashcardTab';
import { FlashcardsTab } from '../../flashcard/FlashcardsTab';
import { AnalysisTab } from '../../analysis/AnalysisTab';
import { TabsNavigation } from '../TabsNavigation';
import { MarkdownToolbar } from '../../markdown/MarkdownToolbar';
import { useRegenerateFlashcard } from '../../../hooks/useRegenerateFlashcard';
import { useUpdateFlashcard } from '../../../hooks/useUpdateFlashcard';
import { usePreventHostKeyboardEvents } from './usePreventHostKeyboardEvents';

interface Position {
  y: number;
}

/**
 * @description Main popup container that can be dragged vertically and responds to page scroll
 */
export const MainPopup: React.FC = () => {
  const isPopupOpen = useAppStore((state) => state.popup.isOpen);
  const activeTab = useAppStore((state) => state.popup.activeTab);
  const closePopup = useAppStore((state) => state.closePopup);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  const [position, setPosition] = useState<Position>(() => {
    // Initialize at bottom of viewport (33% of screen height)
    const viewportHeight = window.innerHeight;
    return { y: viewportHeight * 0.67 }; // 67% from top = popup at bottom
  });
  const { regenerateFlashcardButton } = useRegenerateFlashcard();
  const { updateFlashcardButton } = useUpdateFlashcard();
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollTriggerY, setScrollTriggerY] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Prevent keyboard events from propagating to host page (e.g., Udemy) when popup is open
  // This allows users to type in input fields without triggering host page shortcuts
  usePreventHostKeyboardEvents(popupRef, isPopupOpen);

  // Initialize position when popup opens
  useEffect(() => {
    if (isPopupOpen && !isInitialized) {
      const initialY = window.innerHeight * 0.67; // Position at 67% from top
      setPosition({ y: initialY });
      setIsInitialized(true);
    } else if (isPopupOpen && isInitialized) {
      // If popup was already initialized, use normal position update
      const initialY = window.innerHeight * 0.67;
      setPosition({ y: initialY });
    } else if (!isPopupOpen) {
      // Reset initialization when popup closes
      setIsInitialized(false);
      setIsAtBottom(false);
    }
  }, [isPopupOpen, isInitialized]);

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      if (isDragging) return;

      const currentScrollY = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollBottom = currentScrollY + viewportHeight;

      // Check if we're at the bottom of the page (within 50px)
      const atBottom = scrollBottom >= documentHeight - 50;

      if (atBottom && !isAtBottom) {
        // Move popup up when at bottom
        setIsAtBottom(true);
        setScrollTriggerY(currentScrollY); // Remember where we triggered
        setPosition({ y: 20 }); // 20px from top
      } else if (!atBottom && isAtBottom) {
        // Check if we scrolled up by at least 100px from the trigger point
        const scrollDiff = scrollTriggerY - currentScrollY;
        if (scrollDiff >= 100) {
          // Move popup back to bottom
          setIsAtBottom(false);
          const initialY = window.innerHeight * 0.67;
          setPosition({ y: initialY });
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDragging, isAtBottom, lastScrollY, scrollTriggerY]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target === headerRef.current ||
        headerRef.current?.contains(e.target as Node)
      ) {
        setIsDragging(true);
        setDragStartY(e.clientY);
        setDragStartPosition(position.y);
        e.preventDefault();
      }
    },
    [position.y]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaY = e.clientY - dragStartY;
      const newY = dragStartPosition + deltaY;

      // Constrain to viewport bounds (popup is 33% of viewport height)
      const viewportHeight = window.innerHeight;
      const popupHeight = viewportHeight * 0.33;
      const minY = 0;
      const maxY = viewportHeight - popupHeight;

      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      setPosition({ y: constrainedY });
    },
    [isDragging, dragStartY, dragStartPosition]
  );
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Attach global mouse events for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isDragging && !isAtBottom) {
        const initialY = window.innerHeight * 0.67;
        setPosition({ y: initialY });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDragging, isAtBottom]);

  if (!isPopupOpen) return null;

  return (
    <div
      ref={popupRef}
      className={`fixed bg-white rounded-lg shadow-xl border border-solid border-gray-300 z-[999] w-[98%] max-w-[800px] h-[35%] min-h-[300px] max-h-[600px] grid grid-rows-[auto_auto_1fr] ${
        isDragging ? 'cursor-grabbing' : 'cursor-default'
      } ${
        isDragging || !isInitialized
          ? ''
          : 'transition-[top] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
      }`}
      style={{
        left: '50%',
        transform: 'translate(-50%, 0)',
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header - draggable area */}
      <div
        ref={headerRef}
        className={`flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-semibold text-gray-700">Assistant</h2>
        </div>

        <button
          onClick={closePopup}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          title="Close popup"
        >
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center border-b border-gray-200 bg-gray-50">
        <TabsNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        <MarkdownToolbar className="ml-2" />
        <div className="flex gap-2 px-1">
          {regenerateFlashcardButton}
          {updateFlashcardButton}
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="h-full overflow-y-auto p-4">
          {activeTab === 'new-flashcard' && <FlashcardCreator />}
          {activeTab === 'last-flashcard' && <LastFlashcardTab />}
          {activeTab === 'flashcards' && <FlashcardsTab />}
          {activeTab === 'analysis' && <AnalysisTab />}
        </div>
      </div>
    </div>
  );
};
