# Font Configuration Guide

## Overview
This application uses a simplified Gilroy font configuration with only **Medium (500)** and **Semibold (600)** weights to ensure consistent rendering across all platforms, especially Vercel deployments.

## Available Font Weights

### ✅ Available Weights
- **Medium (500)**: `font-medium` - Default weight for most text
- **Semibold (600)**: `font-semibold` - Used for headings and emphasis

### 🔄 Automatic Fallbacks
- `font-light`, `font-normal`, `font-thin`, `font-extralight` → **Medium (500)**
- `font-bold`, `font-extrabold`, `font-black` → **Semibold (600)**

## Usage Guidelines

### 1. Use Available Classes
```tsx
// ✅ Correct - Use available weights
<p className="font-medium">Regular text</p>
<h1 className="font-semibold">Heading text</h1>

// ❌ Avoid - These will fallback to available weights
<p className="font-light">This will render as Medium</p>
<h1 className="font-black">This will render as Semibold</h1>
```

### 2. Import Font Utilities
```tsx
import { FONT_WEIGHTS, FONT_WEIGHT_CLASSES } from '@/lib/utils/fonts';

// Use constants for consistency
const headingWeight = FONT_WEIGHTS.SEMIBOLD;
const headingClass = FONT_WEIGHT_CLASSES.SEMIBOLD;
```

### 3. CSS Custom Properties
```css
/* Available CSS variables */
--font-sans: Gilroy font family
--font-mono: Fira Code font family
```

## Why This Configuration?

1. **Vercel Compatibility**: Eliminates font weight rendering issues on Vercel
2. **Performance**: Smaller bundle size with fewer font files
3. **Consistency**: Ensures identical appearance across all environments
4. **Maintenance**: Simpler font management and updates

## File Structure
```
config/fonts.ts          # Font configuration
lib/utils/fonts.ts       # Font utility functions
styles/globals.css       # Global font styles
tailwind.config.js       # Tailwind font weight overrides
```

## Migration Notes

If you previously used other font weights:
- `font-light` → `font-medium`
- `font-normal` → `font-medium`  
- `font-bold` → `font-semibold`
- `font-extrabold` → `font-semibold`
- `font-black` → `font-semibold`

## Testing

After deployment, verify:
- [ ] All text renders consistently
- [ ] No font weight warnings in console
- [ ] Consistent appearance across browsers
- [ ] No font loading issues on Vercel
