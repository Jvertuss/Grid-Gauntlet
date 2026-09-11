# Mobile UX pass

This build keeps the existing Gridiron Gauntlet pages, gameplay, scoring, perk logic, and desktop visual design intact. The mobile changes are isolated in `src/styles/mobile.css` plus removal of the old desktop-only minimum-width lock from `src/styles/layout.css`.

## Phone improvements

- Real responsive width instead of the previous 1100px desktop lock.
- Safe-area padding for notches, rounded screens, and installed PWA mode.
- Larger touch targets for primary actions, navigation, legal links, and game controls.
- Readable mobile body text on How To Play, About, Privacy, Terms, and Disclaimer pages.
- Two-column draft cards on normal phone widths to reduce excessive scrolling.
- Horizontal swipe trays for the user's roster and CPU roster during rounds, reducing a seven-card vertical stack to one compact row.
- Compact round player cards that keep the same card design and information.
- Full-width lineup controls and more comfortable battle-row spacing.
- Single-column perk rewards with the existing compact PerkCard design preserved.
- Ultra-narrow and landscape fallbacks instead of horizontal page overflow.
- Touch devices no longer rely on desktop hover movement.
- `prefers-reduced-motion` is respected.

## Recommended device checks before launch

Test at roughly 320, 360, 390, 412, and 430 CSS-pixel widths, plus one tablet width around 768px. Test both regular browser mode and an installed PWA if available.
