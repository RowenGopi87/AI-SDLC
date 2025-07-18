/**
 * Utility functions for safe date formatting
 */

/**
 * Safely formats a date value with proper error handling
 * @param dateValue - The date value to format (can be Date, string, or number)
 * @param options - Intl.DateTimeFormat options
 * @param locale - Locale for formatting (defaults to 'en-US')
 * @returns Formatted date string or fallback message
 */
export function formatDate(
  dateValue: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  },
  locale: string = 'en-US'
): string {
  try {
    // Handle null/undefined values
    if (dateValue === null || dateValue === undefined) {
      return 'No date';
    }

    // Convert to Date object if needed
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    // Format the date
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Invalid date';
  }
}

/**
 * Formats a date for display in UI components
 * @param dateValue - The date value to format
 * @returns Formatted date string for UI display
 */
export function formatDateForDisplay(dateValue: Date | string | number | null | undefined): string {
  return formatDate(dateValue, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Formats a date with time for display
 * @param dateValue - The date value to format
 * @returns Formatted date and time string
 */
export function formatDateTimeForDisplay(dateValue: Date | string | number | null | undefined): string {
  return formatDate(dateValue, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formats a date as a relative time (e.g., "2 days ago")
 * @param dateValue - The date value to format
 * @returns Relative time string
 */
export function formatRelativeTime(dateValue: Date | string | number | null | undefined): string {
  try {
    if (dateValue === null || dateValue === undefined) {
      return 'No date';
    }

    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
    
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays > 1 && diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return formatDateForDisplay(date);
    }
  } catch (error) {
    console.warn('Relative time formatting error:', error);
    return 'Invalid date';
  }
} 