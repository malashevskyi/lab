import { describe, it, expect, beforeEach } from 'vitest';
import { calculatePosition } from './calculatePosition';

describe('calculatePosition', () => {
  // Mock window properties
  const mockWindow = (
    innerWidth: number,
    innerHeight: number,
    scrollX: number,
    scrollY: number
  ) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: innerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: innerHeight,
    });
    Object.defineProperty(window, 'scrollX', {
      writable: true,
      configurable: true,
      value: scrollX,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: scrollY,
    });
  };

  // Create mock DOMRect
  const createDOMRect = (
    left: number,
    top: number,
    right: number,
    bottom: number
  ): DOMRect => {
    return {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
      x: left,
      y: top,
      toJSON: () => ({}),
    };
  };

  beforeEach(() => {
    // Reset to default viewport
    mockWindow(1920, 1080, 0, 0);
  });

  describe('Default positioning (to the right of selection)', () => {
    it('should position button to the right of selection when there is enough space', () => {
      // Selection at (100, 100) to (200, 120)
      const selectionRect = createDOMRect(100, 100, 200, 120);

      const result = calculatePosition(selectionRect);

      // Expected: right edge (200) + offset (10) = 210
      expect(result.x).toBe(210);
      // Expected: top (100) + scroll (0) = 100
      expect(result.y).toBe(100);
    });

    it('should position button considering scroll offset', () => {
      mockWindow(1920, 1080, 500, 300);
      const selectionRect = createDOMRect(100, 100, 200, 120);

      const result = calculatePosition(selectionRect);

      // Expected: right (200) + scrollX (500) + offset (10) = 710
      expect(result.x).toBe(710);
      // Expected: top (100) + scrollY (300) = 400
      expect(result.y).toBe(400);
    });
  });

  describe('Right edge collision detection', () => {
    it('should position button to the left when right edge exceeds viewport', () => {
      mockWindow(1920, 1080, 0, 0);
      // Selection very close to right edge: (1800, 100) to (1900, 120)
      const selectionRect = createDOMRect(1800, 100, 1900, 120);

      const result = calculatePosition(selectionRect);

      // Right edge would be: 1900 + 10 + 160 = 2070 > 1920 (viewport width)
      // Should position to the left: left (1800) - width (160) - offset (10) = 1630
      expect(result.x).toBe(1630);
      expect(result.y).toBe(100);
    });

    it('should align to left edge when both sides are outside viewport', () => {
      mockWindow(200, 1080, 0, 0);
      // Selection wider than available space
      const selectionRect = createDOMRect(10, 100, 150, 120);

      const result = calculatePosition(selectionRect);

      // Right edge: 150 + 10 + 160 = 320 > 200 (viewport)
      // Left positioning: 10 - 160 - 10 = -160 < 0
      // Should fallback to left edge: scrollX (0) + offset (10) = 10
      expect(result.x).toBe(10);
      expect(result.y).toBe(100);
    });

    it('should handle scrolled viewport with right edge collision', () => {
      mockWindow(1920, 1080, 1000, 0);
      // Selection at absolute position that requires left positioning
      const selectionRect = createDOMRect(1850, 100, 1950, 120);

      const result = calculatePosition(selectionRect);

      // Right edge: 1950 + 1000 + 10 + 160 = 3120 > (1920 + 1000) = 2920
      // Left positioning: 1850 + 1000 - 160 - 10 = 2680
      expect(result.x).toBe(2680);
    });
  });

  describe('Bottom edge collision detection', () => {
    it('should position button above selection when bottom edge exceeds viewport', () => {
      mockWindow(1920, 1080, 0, 0);
      // Selection near bottom: (100, 1000) to (200, 1020)
      const selectionRect = createDOMRect(100, 1000, 200, 1020);

      const result = calculatePosition(selectionRect);

      // Bottom edge would be: 1000 + 110 = 1110 > 1080 (viewport height)
      // Should position above: top (1000) - height (110) - offset (10) = 880
      expect(result.x).toBe(210); // Still to the right
      expect(result.y).toBe(880);
    });

    it('should align to top edge when both top and bottom are outside viewport', () => {
      mockWindow(1920, 100, 0, 0);
      // Selection in very small viewport
      const selectionRect = createDOMRect(100, 30, 200, 50);

      const result = calculatePosition(selectionRect);

      // Bottom edge: 30 + 110 = 140 > 100 - doesn't fit
      // Top positioning: 30 - 110 - 10 = -90 < 0
      // Should fallback to top edge: scrollY (0) + offset (10) = 10
      expect(result.x).toBe(210);
      expect(result.y).toBe(10);
    });

    it('should handle scrolled viewport with bottom edge collision', () => {
      mockWindow(1920, 1080, 0, 500);
      // Selection that triggers bottom collision with scroll
      const selectionRect = createDOMRect(100, 1000, 200, 1020);

      const result = calculatePosition(selectionRect);

      // Bottom edge: 1000 + 500 + 110 = 1610 > (1080 + 500) = 1580
      // Position above: 1000 + 500 - 110 - 10 = 1380
      expect(result.x).toBe(210);
      expect(result.y).toBe(1380);
    });
  });

  describe('Corner cases', () => {
    it('should handle selection at top-left corner', () => {
      mockWindow(1920, 1080, 0, 0);
      const selectionRect = createDOMRect(0, 0, 100, 20);

      const result = calculatePosition(selectionRect);

      // Right edge: 100 + 10 = 110 (fits in viewport)
      expect(result.x).toBe(110);
      expect(result.y).toBe(0);
    });

    it('should handle selection at top-right corner', () => {
      mockWindow(1920, 1080, 0, 0);
      const selectionRect = createDOMRect(1850, 0, 1910, 20);

      const result = calculatePosition(selectionRect);

      // Right edge collision: position to left
      // 1850 - 160 - 10 = 1680
      expect(result.x).toBe(1680);
      expect(result.y).toBe(0);
    });

    it('should handle selection at bottom-left corner', () => {
      mockWindow(1920, 1080, 0, 0);
      const selectionRect = createDOMRect(0, 1000, 100, 1020);

      const result = calculatePosition(selectionRect);

      // Right: 100 + 10 = 110 (fits)
      // Bottom collision: position above
      // 1000 - 110 - 10 = 880
      expect(result.x).toBe(110);
      expect(result.y).toBe(880);
    });

    it('should handle selection at bottom-right corner', () => {
      mockWindow(1920, 1080, 0, 0);
      const selectionRect = createDOMRect(1850, 1000, 1910, 1020);

      const result = calculatePosition(selectionRect);

      // Right edge collision: position to left
      // 1850 - 160 - 10 = 1680
      // Bottom collision: position above
      // 1000 - 110 - 10 = 880
      expect(result.x).toBe(1680);
      expect(result.y).toBe(880);
    });

    it('should handle very small viewport', () => {
      mockWindow(200, 150, 0, 0);
      const selectionRect = createDOMRect(50, 50, 100, 70);

      const result = calculatePosition(selectionRect);

      // Right edge: 100 + 10 + 160 = 270 > 200
      // Left positioning: 50 - 160 - 10 = -120 < 0
      // Fallback to left edge: 10
      expect(result.x).toBe(10);

      // Bottom edge: 50 + 110 = 160 > 150
      // Top positioning: 50 - 110 - 10 = -70 < 0
      // Fallback to top edge: 10
      expect(result.y).toBe(10);
    });
  });

  describe('Realistic scenarios', () => {
    it('should handle typical desktop selection in the middle of page', () => {
      mockWindow(1920, 1080, 0, 2000);
      const selectionRect = createDOMRect(500, 300, 700, 320);

      const result = calculatePosition(selectionRect);

      // Right: 700 + 0 + 10 = 710 (fits in viewport)
      expect(result.x).toBe(710);
      // Top: 300 + 2000 = 2300
      expect(result.y).toBe(2300);
    });

    it('should handle mobile viewport', () => {
      mockWindow(375, 667, 0, 1000);
      const selectionRect = createDOMRect(50, 200, 300, 220);

      const result = calculatePosition(selectionRect);

      // Right edge: 300 + 0 + 10 + 160 = 470 > 375
      // Left positioning: 50 + 0 - 160 - 10 = -120 < 0
      // Fallback: 10
      expect(result.x).toBe(10);
      // Top: 200 + 1000 = 1200
      expect(result.y).toBe(1200);
    });

    it('should handle selection in scrolled article', () => {
      mockWindow(1440, 900, 0, 5000);
      // Selection near right edge of content
      const selectionRect = createDOMRect(1200, 400, 1380, 420);

      const result = calculatePosition(selectionRect);

      // Right edge: 1380 + 0 + 10 + 160 = 1550 > 1440
      // Left positioning: 1200 - 160 - 10 = 1030
      expect(result.x).toBe(1030);
      // Top: 400 + 5000 = 5400
      expect(result.y).toBe(5400);
    });
  });
});
