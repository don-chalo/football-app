## Why

The site ends abruptly after `<main>`: there is no footer, so mobile visitors must scroll back to the header to navigate and the club's Instagram has no presence on the site.

## What Changes

- Add a static (end-of-page, non-fixed) public footer to `acsed-web`, rendered on every route below `<main>`.
- Footer content: brand mark (ACSED WEB + ball icon), mirror nav (Ligas/Copas, Stats), external Instagram link `@fcacsed` (`https://www.instagram.com/fcacsed`) with Radix `InstagramLogoIcon`, and a baseline line `Temporada {current year}` computed at render (no slogans).
- Style: `cancha-950` band, white text, same `max-w-2xl mx-auto` container as `main`; footer links meet the ≥44px tap-target rule on mobile.
- No admin links in the footer (public audience; login stays in the header).

## Capabilities

### New Capabilities
- `pie-sitio`: public static site footer with brand, mirror navigation, Instagram link, and dynamic season year.

### Modified Capabilities
- `ux-movil`: footer links SHALL meet the ≥44px tap-target rule and the footer SHALL NOT introduce horizontal scrolling at 360px.

## Impact

- `acsed-web/src/App.tsx` (new `Footer` component rendered below `main`); new test file for footer links/year.
- No API changes. No new dependencies (`InstagramLogoIcon` ships with `@radix-ui/react-icons`, already used).
