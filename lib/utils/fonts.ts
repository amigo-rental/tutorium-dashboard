/**
 * Font weight constants for consistent usage across the application
 * Only Medium (500) and Semibold (600) weights are available
 */

export const FONT_WEIGHTS = {
  MEDIUM: 500,
  SEMIBOLD: 600,
} as const;

export type FontWeight = (typeof FONT_WEIGHTS)[keyof typeof FONT_WEIGHTS];

/**
 * Get the appropriate font weight for a given weight request
 * Falls back to available weights if the requested weight is not available
 */
export function getFontWeight(requestedWeight: number | string): FontWeight {
  const weight =
    typeof requestedWeight === "string"
      ? parseInt(requestedWeight)
      : requestedWeight;

  // If weight is 600 or higher, use Semibold
  if (weight >= 600) {
    return FONT_WEIGHTS.SEMIBOLD;
  }

  // Otherwise, use Medium as default
  return FONT_WEIGHTS.MEDIUM;
}

/**
 * CSS classes for consistent font weight usage
 */
export const FONT_WEIGHT_CLASSES = {
  MEDIUM: "font-medium",
  SEMIBOLD: "font-semibold",
} as const;

/**
 * Tailwind CSS classes that will work with our font configuration
 */
export const VALID_FONT_WEIGHT_CLASSES = [
  "font-medium",
  "font-semibold",
] as const;

/**
 * Check if a font weight class is valid for our configuration
 */
export function isValidFontWeightClass(className: string): boolean {
  return VALID_FONT_WEIGHT_CLASSES.includes(className as any);
}
