---
name: Kitchen Native
colors:
  surface: '#f7faf6'
  surface-dim: '#d8dbd7'
  surface-bright: '#f7faf6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f0'
  surface-container: '#ecefeb'
  surface-container-high: '#e6e9e5'
  surface-container-highest: '#e0e3df'
  on-surface: '#181c1a'
  on-surface-variant: '#3f4941'
  inverse-surface: '#2d312f'
  inverse-on-surface: '#eef2ee'
  outline: '#6f7a71'
  outline-variant: '#bec9bf'
  surface-tint: '#066c41'
  primary: '#006038'
  on-primary: '#ffffff'
  primary-container: '#1f7a4d'
  on-primary-container: '#aeffca'
  inverse-primary: '#82d8a3'
  secondary: '#58605b'
  on-secondary: '#ffffff'
  secondary-container: '#dce5de'
  on-secondary-container: '#5e6661'
  tertiary: '#49574d'
  on-tertiary: '#ffffff'
  tertiary-container: '#616f65'
  on-tertiary-container: '#e2f2e5'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#9ef5be'
  primary-fixed-dim: '#82d8a3'
  on-primary-fixed: '#002110'
  on-primary-fixed-variant: '#00522f'
  secondary-fixed: '#dce5de'
  secondary-fixed-dim: '#c0c9c2'
  on-secondary-fixed: '#151d19'
  on-secondary-fixed-variant: '#404944'
  tertiary-fixed: '#d7e6da'
  tertiary-fixed-dim: '#bbcabe'
  on-tertiary-fixed: '#121e17'
  on-tertiary-fixed-variant: '#3c4a41'
  background: '#f7faf6'
  on-background: '#181c1a'
  surface-variant: '#e0e3df'
  surface-elevated: '#FFFFFF'
  border-subtle: '#D8E4DA'
  text-primary: '#17211B'
  brand-pressed: '#165E3A'
  status-waiting: '#C27A20'
  status-attention: '#B5433D'
  status-info: '#3867D6'
  dark-surface: '#0F1612'
  dark-surface-elevated: '#162019'
  dark-brand-primary: '#6DDBA0'
typography:
  screen-title:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  screen-title-mobile:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  section-title:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  baseline: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  screen-edge: 20px
  touch-target: 48px
---

## Brand & Style

The design system is built on a **Corporate / Modern** foundation, specifically tailored for a "kitchen-native" appliance experience. It bridges the gap between high-tech hydroponics and friendly home companions. The aesthetic is **Fresh, Tactile, and Calm**, prioritizing clarity over technical density.

The UI avoids "lab-dashboard" tropes—no complex line graphs, neon alerts, or high-density data tables. Instead, it uses a **Passive Status** philosophy, communicating information through plain language and soft visual cues. This ensures the product feels like a helpful appliance rather than a stressful monitoring tool.

### Design Principles
- **One Next Action:** Every screen in the onboarding and setup flow focuses on a single primary action to prevent overwhelm.
- **Calm, Not Alarm:** Status updates are informative and steady, never vibrating or flashing.
- **Tactile Materialism:** Depth is created through surface tonal layers and 8px-rounded containers that feel physical and touchable.
- **Urban Freshness:** The palette and whitespace reflect clean, modern Indian urban living spaces.

## Colors

The color strategy is anchored by **Botanical Green** (`#1F7A4D`), representing growth and freshness. The default mode is **Light**, utilizing a very soft, tinted neutral background (`#F7FAF6`) to avoid the clinical harshness of pure white.

### Color Roles
- **Primary:** Used for brand signatures, primary action buttons, and successful status states.
- **Secondary:** Used for subtle container backgrounds and secondary navigation elements.
- **Neutral:** The foundational background color that sets the "fresh" tone of the app.
- **Status:** Functional colors (Waiting, Attention, Info) are used for operational feedback. These must always be paired with text or icons to ensure accessibility; color alone never conveys meaning.

## Typography

The system uses a two-font pairing strategy. **Outfit** is used for display moments—screen titles and section headers—to provide a geometric, modern, and friendly brand character. **Inter** (or the Android system default) is used for all functional copy, ensuring maximum readability on mobile displays.

### Rules
- **Sentence Case:** Avoid all-caps for section headers or labels to maintain a calm, conversational tone.
- **Contrast:** All body and label text must meet WCAG AA contrast standards against their respective backgrounds.
- **Reading Length:** Keep instructional copy to a maximum of 3 lines per block to preserve whitespace.

## Layout & Spacing

This design system uses a **fixed-width grid** approach within a fluid container. The standard layout relies on a **20px screen-edge margin** (gutter) for all mobile screens.

### Spacing Rhythm
- **4px Baseline:** All vertical and horizontal spacing should be increments of 4px.
- **Standard Gap (16px):** Use for spacing between items within a card or list.
- **Section Gap (24px - 32px):** Use for major vertical breaks between logical content groups (e.g., between the Dashboard status tiles and the Learn section).
- **Dashboard Grid:** Status tiles use a 2-column fixed grid layout on mobile to provide a stable, predictable interface that doesn't shift as values change.

## Elevation & Depth

Visual hierarchy is conveyed through **Tonal Layers** and **Ambient Shadows**. The design avoids harsh outlines in favor of stacked surfaces.

### Surface Tiers
- **Tier 0 (Base):** The `surface` background (`#F7FAF6`). All primary content sits here.
- **Tier 1 (Cards):** The `surface-elevated` (`#FFFFFF`) used for status tiles, plant cards, and inputs. These use a very soft, diffused shadow with a low opacity (5-8%) and a subtle green tint to match the brand.
- **Tier 2 (Sheets):** Overlays and bottom sheets used for setup and support. These use a 20% backdrop dimming overlay to focus the user's attention.

No card-nesting is permitted. If an element requires grouping inside a card, use `surface-soft` or a hairline `border-subtle` rather than creating a new elevated layer.

## Shapes

The shape language is **Rounded**, reflecting the soft edges of kitchen appliances and organic plant life.

### Corner Radii
- **Buttons:** Pill-shaped (Fully Rounded) for maximum tactility.
- **Cards & Inputs:** 8px (`rounded-md`).
- **Image Masks:** 16px (`rounded-lg`) for plant and crop photography.
- **Bottom Sheets:** 24px top-radius only to create a "container" feel that slides from the bottom.
- **Icons:** Always use rounded-line families with consistent stroke weights.

## Components

### Buttons
- **Primary:** Pill-shaped, `brand_primary` background, `white` text. Used for the "One Next Action." Minimum height 52dp.
- **Secondary:** Pill-shaped, `surface_soft` background or ghost-style with a subtle border.
- **Destructive:** Pill-shaped, using `status-attention` red.

### Status Tiles
- Fixed 8px radius cards.
- Layout: Top-left icon + label, Center-aligned plain-language status (e.g., "Water is low"), Bottom-right timestamp or meta-data.

### Text Inputs
- Labels always positioned **above** the field.
- 8px corner radius with `border-subtle`.
- Focus state: Border transitions to `brand_primary` (2dp width).

### Plant Cards
- Vertical layout with a 16px-rounded image at the top.
- Plant name in Outfit (Section Title) below the image.
- Status badge (e.g., "Ready to Harvest") using `surface-soft` background.

### Bottom Sheets
- Used for QR scanning, plant selection details, and support articles.
- Must include a clear "handle" or close action.
- Content should follow the 2-tap support rule: help must be reachable within two interactions.