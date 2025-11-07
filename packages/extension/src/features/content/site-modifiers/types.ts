/**
 * Site Modifier Types
 *
 * This module defines types for site-specific modifications.
 * Each site can have its own modifier that applies custom styles and behaviors.
 */

/**
 * Interface for site-specific modifiers
 */
export interface SiteModifier {
  /**
   * Unique identifier for the platform (e.g., 'udemy', 'coursera')
   */
  id: string;

  /**
   * Display name of the platform
   */
  name: string;

  /**
   * Function to check if current URL matches this platform
   */
  matches: (url: string) => boolean;

  /**
   * Function to initialize modifications for this site
   * Should be called once when the site is detected
   */
  initialize: () => void;

  /**
   * Function to cleanup modifications
   * Should be called when leaving the site or on unmount
   */
  cleanup?: () => void;
}
