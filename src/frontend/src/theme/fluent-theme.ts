import { createLightTheme, createDarkTheme } from '@fluentui/react-components';
import type { BrandVariants, Theme } from '@fluentui/react-components';

// =============================================================================
// Custom Brand Colors for Research Feedback Platform
// Based on Fluent 2 Design System
// https://fluent2.microsoft.design/color
// =============================================================================

/**
 * Brand color palette generated using Fluent 2 color guidelines
 * Primary brand color: #0078D4 (Microsoft Blue)
 */
export const surveyBrandColors: BrandVariants = {
  10: '#001F3F',
  20: '#002E5C',
  30: '#003D7A',
  40: '#004C99',
  50: '#005BB8',
  60: '#006AD6',
  70: '#0078D4', // Primary
  80: '#2899F5',
  90: '#5CB1F7',
  100: '#8FC9F9',
  110: '#B4DBFB',
  120: '#D4EBFD',
  130: '#E8F4FE',
  140: '#F5FAFF',
  150: '#FAFCFF',
  160: '#FFFFFF',
};

// Create light and dark themes with custom brand
export const surveyLightTheme: Theme = {
  ...createLightTheme(surveyBrandColors),
};

export const surveyDarkTheme: Theme = {
  ...createDarkTheme(surveyBrandColors),
};

// =============================================================================
// Typography Tokens (Fluent 2 Type Ramp)
// https://fluent2.microsoft.design/typography
// =============================================================================

/**
 * Fluent 2 Typography Scale Reference:
 * 
 * | Name              | Weight    | Size/Line Height |
 * |-------------------|-----------|------------------|
 * | Caption 2         | Regular   | 10px / 14px      |
 * | Caption 2 Strong  | Semibold  | 10px / 14px      |
 * | Caption 1         | Regular   | 12px / 16px      |
 * | Caption 1 Strong  | Semibold  | 12px / 16px      |
 * | Body 1            | Regular   | 14px / 20px      |
 * | Body 1 Strong     | Semibold  | 14px / 20px      |
 * | Subtitle 2        | Semibold  | 16px / 22px      |
 * | Subtitle 1        | Semibold  | 20px / 26px      |
 * | Title 3           | Semibold  | 24px / 32px      |
 * | Title 2           | Semibold  | 28px / 36px      |
 * | Title 1           | Semibold  | 32px / 40px      |
 * | Large Title       | Semibold  | 40px / 52px      |
 * | Display           | Semibold  | 68px / 92px      |
 * 
 * These are automatically available through Fluent UI's Text component
 * using the `size` prop (100-1000) and `weight` prop.
 * 
 * Usage:
 *   <Text size={500} weight="semibold">Subtitle 1</Text>
 *   <Text size={300}>Body 1</Text>
 * 
 * Size mapping:
 *   100 = Caption 2 (10px)
 *   200 = Caption 1 (12px)
 *   300 = Body 1 (14px)
 *   400 = Body 1 Large (16px)
 *   500 = Subtitle 1 (20px)
 *   600 = Title 3 (24px)
 *   700 = Title 2 (28px)
 *   800 = Title 1 (32px)
 *   900 = Large Title (40px)
 *   1000 = Display (68px)
 */

// =============================================================================
// Semantic Color Tokens Reference
// https://storybooks.fluentui.dev/react/?path=/docs/theme-colors--docs
// =============================================================================

/**
 * Neutral Colors:
 *   - colorNeutralForeground1: Primary text
 *   - colorNeutralForeground2: Secondary text
 *   - colorNeutralForeground3: Tertiary/disabled text
 *   - colorNeutralBackground1: Primary background
 *   - colorNeutralBackground2: Secondary/elevated background
 *   - colorNeutralBackground3: Tertiary background
 *   - colorNeutralStroke1: Primary borders
 *   - colorNeutralStroke2: Secondary borders
 * 
 * Brand Colors:
 *   - colorBrandForeground1: Brand text
 *   - colorBrandBackground: Brand background
 *   - colorBrandBackgroundHover: Brand background on hover
 *   - colorBrandStroke1: Brand borders
 * 
 * Status Colors:
 *   - colorPaletteRedForeground1: Error text
 *   - colorPaletteRedBackground1: Error background
 *   - colorPaletteGreenForeground1: Success text
 *   - colorPaletteGreenBackground1: Success background
 *   - colorPaletteYellowForeground1: Warning text
 *   - colorPaletteYellowBackground1: Warning background
 * 
 * Usage in makeStyles:
 *   const useStyles = makeStyles({
 *     root: {
 *       color: tokens.colorNeutralForeground1,
 *       backgroundColor: tokens.colorNeutralBackground1,
 *     },
 *   });
 */

export default surveyLightTheme;
