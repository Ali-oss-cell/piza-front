---
name: Matte Noir & Neon
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#201f21'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#e4bdc3'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#303032'
  outline: '#ab888e'
  outline-variant: '#5b3f45'
  surface-tint: '#ffb1c1'
  primary: '#ffb1c1'
  on-primary: '#66002a'
  primary-container: '#ff4c84'
  on-primary-container: '#5a0024'
  inverse-primary: '#bc0053'
  secondary: '#c6c6c7'
  on-secondary: '#2f3131'
  secondary-container: '#454747'
  on-secondary-container: '#b4b5b5'
  tertiary: '#c8c5cb'
  on-tertiary: '#303034'
  tertiary-container: '#919095'
  on-tertiary-container: '#29292d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffd9df'
  primary-fixed-dim: '#ffb1c1'
  on-primary-fixed: '#3f0017'
  on-primary-fixed-variant: '#90003e'
  secondary-fixed: '#e2e2e2'
  secondary-fixed-dim: '#c6c6c7'
  on-secondary-fixed: '#1a1c1c'
  on-secondary-fixed-variant: '#454747'
  tertiary-fixed: '#e4e1e7'
  tertiary-fixed-dim: '#c8c5cb'
  on-tertiary-fixed: '#1b1b1f'
  on-tertiary-fixed-variant: '#47464b'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
typography:
  headline-xl:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Sora
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1200px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

This design system is built for a premium, high-fidelity culinary experience. The brand personality is sophisticated, energetic, and ultra-modern, targeting a tech-savvy urban audience that appreciates precision and aesthetic clarity. 

The design style is **Minimalism with a High-Contrast edge**. It utilizes a deep matte foundation to allow food photography and the vibrant accent pink to command attention. The aesthetic response should be one of "digital luxury"—combining the raw energy of late-night city dining with the structured elegance of a high-end SaaS product. Expect heavy use of whitespace (blackspace), razor-sharp typography, and a deliberate absence of unnecessary decorative elements.

## Colors

The palette is anchored by a deep matte black (`#0F0F11`) which serves as the canvas, eliminating the grey-ish tones typical of standard dark modes to ensure "true black" depth. 

- **Primary (#FF2B79):** A high-vibrancy "Electric Pink" used exclusively for primary actions, critical interactive states, and price highlights.
- **Secondary (#FFFFFF):** Used for primary headings and high-priority content to ensure maximum readability against the dark background.
- **Surface (#1E1E22):** A subtle elevation color for cards and container backgrounds to differentiate from the base canvas.
- **Muted (#8E8E93):** Used for secondary text, metadata, and inactive icons.

## Typography

The typography strategy pairs the geometric, tech-forward **Sora** for headlines with the clean, contemporary **Hanken Grotesk** for functional text. 

Headlines should be set with tight letter-spacing to create a "blocky," impactful look. For the mobile experience, large display headers scale down to maintain layout integrity while preserving their bold weight. Body text utilizes generous line height to ensure legibility in low-light environments. Labels and badges use uppercase Hanken Grotesk with increased tracking to create a rhythmic, architectural feel.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop to maintain a cinematic, centered feel, while transitioning to a **Fluid Grid** for mobile.

- **Desktop:** 12-column grid with a 1200px max-width. Margins are intentionally wide (64px) to create an "editorial" frame around the content.
- **Mobile:** 4-column grid with 20px margins.
- **Rhythm:** All spacing is based on an 8px baseline. Use 16px (2x) for internal component padding and 48px-64px (6x-8x) for section vertical margins to ensure a breathy, minimalist feel.

## Elevation & Depth

To maintain the high-fidelity minimalist look, depth is communicated through **Tonal Layers** rather than shadows. 

1. **Base Layer:** `#0F0F11` (The canvas).
2. **Elevated Layer:** `#1E1E22` (Cards, menu items, input backgrounds).
3. **Overlays:** A 1px solid border using `#FFFFFF` at 10% opacity is used on elevated elements to define edges against the black background.

Shadows should be avoided entirely. If a modal or high-priority element requires focus, use a 40% opacity black backdrop blur (20px radius) to dim the layers beneath it.

## Shapes

The shape language is **Soft (0.25rem)**. This provides just enough curvature to feel modern and premium without leaning into the playfulness of fully rounded UI. 

- **Small elements (Buttons, Inputs):** 4px (0.25rem) radius.
- **Medium elements (Cards, Modals):** 8px (0.5rem) radius.
- **Accent elements (Badges, Chips):** 0px (Sharp) or 4px—never pill-shaped.

The interaction of sharp-cut imagery and slightly softened corners creates a sophisticated contrast.

## Components

- **Buttons:** Primary buttons are solid `#FF2B79` with white text. Secondary buttons are outlined (1px) in white at 20% opacity. All buttons use 16px vertical padding and 32px horizontal padding for a substantial, high-contrast look.
- **Menu Cards:** Use the `#1E1E22` surface color. Food photography should be flush to the top with a subtle 10% white border. Price points are highlighted in `#FF2B79` using the `headline-md` style.
- **Inputs:** Dark backgrounds (`#1E1E22`) with a bottom-only 2px border that turns pink on focus. No 4-sided boxes for a sleeker, more minimalist appearance.
- **Badges:** Small, rectangular tags with no border-radius, using `#FF2B79` background and white text for high-urgency items like "New" or "Hot."
- **Lists:** Clean separators using 1px lines at 5% white opacity. No icons unless necessary for functional navigation.
- **Icons:** Thin-stroke (1.5pt) minimalist icons. All icons should be white or pink, never multi-colored.