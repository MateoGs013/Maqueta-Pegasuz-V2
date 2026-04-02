// Component registry — metadata for the gallery viewer

export const heroes = [
  { name: 'S-KineticGrid',          label: 'Kinetic Grid',           signature: 'Scrub-driven text grid' },
  { name: 'S-FullBleedOverlay',     label: 'Full Bleed Overlay',     signature: 'Full-bleed image overlay' },
  { name: 'S-TypeMonument',         label: 'Type Monument',          signature: 'Monumental oversized type' },
  { name: 'S-BentoDashboard',       label: 'Bento Dashboard',        signature: 'Bento grid layout' },
  { name: 'S-ColorBlock',           label: 'Color Block',            signature: 'The Razor Division' },
  { name: 'S-Scattered',            label: 'Scattered',              signature: 'Snap to attention' },
  { name: 'S-BrutalistGrid',        label: 'Brutalist Grid',         signature: 'Rule drawing entrance' },
  { name: 'S-DiagonalSlash',        label: 'Diagonal Slash',         signature: 'Clip-path scroll diagonal' },
  { name: 'S-WorkMosaic',           label: 'Work Mosaic',            signature: 'Organic stagger mosaic' },
  { name: 'S-ProductStage',         label: 'Product Stage',          signature: 'Floating product + glow' },
  { name: 'S-ArtisanWarm',          label: 'Artisan Warm',           signature: 'Origin stamp · light theme' },
  { name: 'S-FloatingGlassHUD',     label: 'Floating Glass HUD',     signature: 'Drifting glass panels' },
  { name: 'S-OrbitalShowcase',      label: 'Orbital Showcase',       signature: 'Counter-rotating orbits' },
  { name: 'S-CinematicCurtain',     label: 'Cinematic Curtain',      signature: 'Elastic curtain reveal' },
  { name: 'S-MarqueeTicker',        label: 'Marquee Ticker',         signature: 'timeScale spotlight hover' },
  { name: 'S-TypographicCascade',   label: 'Typographic Cascade',    signature: 'Per-line parallax depth' },
  { name: 'S-HorizontalFilmStrip',  label: 'Horizontal Film Strip',  signature: 'Playhead sweep · draggable' },
  { name: 'S-StackedPanels',        label: 'Stacked Panels',         signature: 'Depth stack peek' },
  { name: 'S-CardDeckStack',        label: 'Card Deck Stack',        signature: 'The Grand Reveal' },
  { name: 'S-AmbientAtmosphere',    label: 'Ambient Atmosphere',     signature: 'Breathing canvas particles' },
  { name: 'S-SplitScrollNarrative', label: 'Split Scroll Narrative', signature: 'The Living Left' },
]

export const navs = [
  { name: 'N-FloatingPill',      label: 'Floating Pill',       signature: 'Centered glass pill' },
  { name: 'N-SideNavbar',        label: 'Side Navbar',         signature: 'Collapsible icon sidebar' },
  { name: 'N-FullscreenOverlay', label: 'Fullscreen Overlay',  signature: 'Dual-panel split reveal' },
  { name: 'N-GlassBlur',         label: 'Glass Blur',          signature: 'Amber bottom glow' },
  { name: 'N-HiddenReveal',      label: 'Hidden Reveal',       signature: 'Smart hide · progress bar' },
  { name: 'N-MicroShrink',       label: 'Micro Shrink',        signature: 'Scrub-driven compact' },
  { name: 'N-BottomFixedPill',   label: 'Bottom Fixed Pill',   signature: 'Tab-bar with sliding blob' },
  { name: 'N-MinimalHamburger',  label: 'Minimal Hamburger',   signature: 'Asymmetric 3-line · right panel' },
  { name: 'N-SplitCorners',      label: 'Split Corners',       signature: 'Four-corner deconstruction' },
  { name: 'N-Contextual',        label: 'Contextual',          signature: 'Theme-adaptive per section' },
]

export const all = [...heroes, ...navs]
