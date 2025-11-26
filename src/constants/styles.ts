/**
 * Tailwind CSS Class Constants
 *
 * Centralized styling patterns to reduce duplication and maintain consistency.
 * Following DRY principle and creating a design system.
 */

export const FORM_STYLES = {
  // Container styles
  CONTAINER: 'bg-white p-8 rounded-lg shadow-md',
  SECTION: 'mb-6',

  // Label styles
  LABEL: 'block text-sm font-medium text-gray-700 mb-1',
  REQUIRED_INDICATOR: 'text-red-500 ml-1',

  // Input styles
  INPUT_BASE: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm',
  INPUT_TEXT: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500',
  INPUT_TEXTAREA: 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 min-h-[100px]',
  INPUT_FILE: 'mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100',
  INPUT_CHECKBOX: 'h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded',

  // Button styles
  BUTTON_PRIMARY: 'bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors',
  BUTTON_SECONDARY: 'bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors',
  BUTTON_DANGER: 'bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors',
  BUTTON_SUCCESS: 'bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors',

  // Helper text
  HELPER_TEXT: 'text-sm text-gray-500 mt-1',
  ERROR_TEXT: 'text-sm text-red-600 mt-1',
} as const;

export const CARD_STYLES = {
  // Card container
  CONTAINER: 'bg-white rounded-lg shadow-md overflow-hidden',
  CONTAINER_HOVER: 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow',

  // Card sections
  HEADER: 'p-6 border-b border-gray-200',
  BODY: 'p-6',
  FOOTER: 'p-6 border-t border-gray-200 bg-gray-50',

  // Card elements
  TITLE: 'text-xl font-semibold text-gray-900',
  SUBTITLE: 'text-sm text-gray-600 mt-1',
  IMAGE: 'w-full h-48 object-cover',
} as const;

export const LIST_STYLES = {
  CONTAINER: 'space-y-4',
  ITEM: 'border-b border-gray-200 pb-4 last:border-b-0',
  GRID: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
} as const;

export const ADMIN_STYLES = {
  PAGE_CONTAINER: 'max-w-7xl mx-auto py-8 px-4',
  PAGE_HEADER: 'mb-8',
  PAGE_TITLE: 'text-3xl font-bold text-gray-900',
  ACTIONS_BAR: 'flex justify-between items-center mb-6',
} as const;

export const ICON_SIZES = {
  SM: 'w-4 h-4',
  MD: 'w-5 h-5',
  LG: 'w-6 h-6',
  XL: 'w-8 h-8',
} as const;

/**
 * Helper function to combine Tailwind classes
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
