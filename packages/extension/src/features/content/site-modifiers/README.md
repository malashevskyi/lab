# Site Modifiers

Site-specific modifications for Assistant browser extension.

## Overview

The Site Modifiers system allows Assistant to apply custom styles and behaviors to specific websites, making them more compatible with flashcard creation and text selection features.

## Architecture

The system is designed to be scalable and maintainable:

```
site-modifiers/
├── index.ts           # Registry and initialization logic
├── types.ts           # TypeScript interfaces
└── [platform-name]/   # Platform-specific implementations
    ├── index.ts       # Platform modifier implementation
    └── styles.css     # Platform-specific styles
```

## How It Works

1. **Auto-detection**: The system automatically detects the current website based on URL patterns
2. **Dynamic initialization**: Matching modifiers are initialized automatically
3. **SPA support**: Handles navigation in Single Page Applications (like Udemy)
4. **Cleanup**: Properly cleans up modifications when leaving a site

## Currently Supported Platforms

### Udemy

**Modifications:**

- Removes underline hover effect from transcript text
- Removes purple borders and box-shadows from active transcript lines
- Adds a purple seek button (▶) at the start of each transcript line
  - Clicking the button navigates to that timestamp in the video
  - Preserves original Udemy seek functionality
- Disables click-to-seek functionality on transcript text content
- Makes transcript text fully selectable for flashcard creation
- Preserves visual highlighting (yellow background) for active transcript segments

**URL Pattern:** `*.udemy.com/course/*`

## Adding a New Platform

To add support for a new platform (e.g., Coursera, YouTube):

### 1. Create platform folder

```bash
mkdir packages/extension/src/features/content/site-modifiers/coursera
```

### 2. Create styles file

`site-modifiers/coursera/styles.css`

```css
/* Your platform-specific CSS here */
.some-platform-element {
  user-select: text !important;
}
```

### 3. Implement the modifier

`site-modifiers/coursera/index.ts`

```typescript
import type { SiteModifier } from '../types';
import styles from './styles.css?inline';

const initialize = (): void => {
  // Your initialization logic
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
};

const cleanup = (): void => {
  // Your cleanup logic
};

const matches = (url: string): boolean => {
  return url.includes('coursera.org');
};

export const courseraModifier: SiteModifier = {
  id: 'coursera',
  name: 'Coursera',
  matches,
  initialize,
  cleanup,
};
```

### 4. Register the modifier

Add it to `site-modifiers/index.ts`:

```typescript
import { courseraModifier } from './coursera';

const modifiers: SiteModifier[] = [
  udemyModifier,
  courseraModifier, // Add your new modifier here
];
```

## API Reference

### SiteModifier Interface

```typescript
interface SiteModifier {
  // Unique identifier (e.g., 'udemy')
  id: string;

  // Display name (e.g., 'Udemy')
  name: string;

  // Function to check if URL matches this platform
  matches: (url: string) => boolean;

  // Initialize modifications
  initialize: () => void;

  // Cleanup modifications (optional)
  cleanup?: () => void;
}
```

### Available Functions

- `initializeSiteModifiers()`: Initialize modifiers based on current URL
- `cleanupSiteModifiers()`: Clean up all active modifiers
- `reinitializeSiteModifiers()`: Re-initialize (useful for SPA navigation)

## Technical Details

### URL Change Detection

The system monitors URL changes through multiple mechanisms:

1. **MutationObserver**: Detects DOM changes that might indicate navigation
2. **popstate event**: Catches browser back/forward navigation
3. **History API interception**: Monitors `pushState` and `replaceState` calls

### Performance Considerations

- Uses `requestIdleCallback` when available for non-critical operations
- Efficient selector queries with specific data attributes
- Minimal DOM manipulation
- Automatic cleanup to prevent memory leaks

### Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (with minor polyfills for older versions)

## Debugging

Enable debug logging by opening DevTools Console:

```javascript
// You'll see logs like:
[Assistant] Initializing Udemy site modifier
[Assistant] URL changed, reinitializing site modifiers
[Assistant] Navigation detected (pushState)
```

## Best Practices

1. **Minimal CSS**: Only override what's necessary
2. **Use !important sparingly**: Only when absolutely needed to override host styles
3. **Specific selectors**: Use data attributes when possible to avoid conflicts
4. **Cleanup**: Always implement cleanup function to prevent memory leaks
5. **Test navigation**: Ensure modifications work after page navigation
6. **Performance**: Use event delegation and efficient queries

## Future Enhancements

Potential additions for future versions:

- YouTube video subtitle modifications
- Coursera lecture note enhancements
- Khan Academy content improvements
- edX platform support
- LinkedIn Learning integration
- Custom platform configuration via settings UI

## Troubleshooting

### Modifications not applying

1. Check if URL pattern matches correctly
2. Verify the element selectors are correct
3. Check browser console for errors
4. Ensure content script is loaded

### Styles not overriding host styles

1. Increase specificity of selectors
2. Use `!important` if necessary
3. Check if styles are being injected in the correct order

### Memory leaks

1. Ensure cleanup function disconnects all observers
2. Remove event listeners properly
3. Clear references to DOM elements
