import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAppStore } from '../../../store';
import { FlashcardCreator } from '../FlashcardCreator';

interface Position {
  y: number;
}

/**
 * @description Main popup container that can be dragged vertically and responds to page scroll
 */
export const MainPopup: React.FC = () => {
  const isPopupOpen = useAppStore(
    (state) => state.flashcardCreator.isPopupOpen
  );
  const closeFlashcardPopup = useAppStore((state) => state.closeFlashcardPopup);

  const [position, setPosition] = useState<Position>(() => {
    // Initialize with correct bottom position immediately
    const viewportHeight = window.innerHeight;
    const minHeight = 250;
    const maxHeight = 500;
    const calculatedHeight = Math.min(maxHeight, viewportHeight / 3);
    const height = Math.max(minHeight, calculatedHeight);
    return { y: viewportHeight - height };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPosition, setDragStartPosition] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollTriggerY, setScrollTriggerY] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Calculate initial position and dimensions
  const getPopupDimensions = useCallback(() => {
    const viewportHeight = window.innerHeight;
    const minHeight = 250;
    const maxHeight = 500;
    const calculatedHeight = Math.min(maxHeight, viewportHeight / 3);
    const height = Math.max(minHeight, calculatedHeight);

    return {
      height,
      initialY: viewportHeight - height,
    };
  }, []);

  // Initialize position when popup opens
  useEffect(() => {
    if (isPopupOpen && !isInitialized) {
      const { initialY } = getPopupDimensions();
      setPosition({ y: initialY });
      setIsInitialized(true);
    } else if (isPopupOpen && isInitialized) {
      // If popup was already initialized, use normal position update
      const { initialY } = getPopupDimensions();
      setPosition({ y: initialY });
    } else if (!isPopupOpen) {
      // Reset initialization when popup closes
      setIsInitialized(false);
      setIsAtBottom(false);
    }
  }, [isPopupOpen, getPopupDimensions, isInitialized]);

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
          const { initialY } = getPopupDimensions();
          setPosition({ y: initialY });
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDragging, isAtBottom, lastScrollY, scrollTriggerY, getPopupDimensions]);

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

      // Constrain to viewport bounds
      const { height: popupHeight } = getPopupDimensions();
      const minY = 0;
      const maxY = window.innerHeight - popupHeight;

      const constrainedY = Math.max(minY, Math.min(maxY, newY));
      setPosition({ y: constrainedY });
    },
    [isDragging, dragStartY, dragStartPosition, getPopupDimensions]
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
        const { initialY } = getPopupDimensions();
        setPosition({ y: initialY });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isDragging, isAtBottom, getPopupDimensions]);

  if (!isPopupOpen) return null;

  const { height } = getPopupDimensions();

  return (
    <div
      ref={popupRef}
      className="fixed left-1/2 bg-white rounded-lg shadow-xl border border-gray-300 z-[999999999]"
      style={{
        width: '98%',
        maxWidth: '1000px',
        height: `${height}px`,
        minHeight: '250px',
        transform: `translate(-50%, 0)`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        transition:
          isDragging || !isInitialized
            ? 'none'
            : 'top 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header - draggable area */}
      <div
        ref={headerRef}
        className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg cursor-grab select-none"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <h2 className="text-sm font-semibold text-gray-700">
            DeepRead Assistant
          </h2>
        </div>

        <button
          onClick={closeFlashcardPopup}
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

      {/* Content area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-4">
          <FlashcardCreator />
        </div>
      </div>
    </div>
  );
};
