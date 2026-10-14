# Design: footer-sitio

## Context

See proposal.md (Why). `App.tsx` renders `Barra` + `main` with no footer. `@radix-ui/react-icons` is already a dependency and exports `InstagramLogoIcon`.

## Goals / Non-Goals

- Goals: static public footer on all routes; mirror nav; external Instagram; dynamic season year.
- Non-Goals: admin links in footer; fixed/sticky footer; slogans; new dependencies; API changes.

## Decisions

- **New `Footer` component in `App.tsx`** (same file as `Barra`) over a separate file: single small presentational component, mirrors existing `Barra` pattern.
  - Alternative: `components/Footer.tsx` — unnecessary indirection for ~30 lines; `Barra` already lives in `App.tsx`.
- **Year via `new Date().getFullYear()`** over hardcoded constant: auto-updates per user decision.
- **`InstagramLogoIcon` from Radix** over inline SVG: zero new code, consistent with `HamburgerMenuIcon` usage.
- **External link `target="_blank" rel="noreferrer"`**: keeps the visitor's page; `noreferrer` implies `noopener`.
- **Container `max-w-2xl mx-auto px-4`**: aligns footer with `main`; band `bg-cancha-950 text-white` mirrors header.
- **Footer links `min-h-11`**: reuses the ≥44px pattern from header nav classes.

## Risks / Trade-offs

- Year depends on client clock — acceptable for a display-only season label.
- External Instagram URL is hardcoded — acceptable; it is club identity, not config.
