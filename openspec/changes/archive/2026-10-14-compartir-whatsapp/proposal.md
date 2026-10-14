## Why

When a partido ends, visitors and admins want to share the resultado on WhatsApp. Today they must copy it by hand. A one-tap "Compartir" button that opens `wa.me` with the formatted resultado removes that friction.

## What Changes

- Add a "Compartir por WhatsApp" button on finished partidos, opening `https://wa.me/?text=<encoded>` (no fixed number — the user picks the chat).
- Message format:
  - Line 1: `LOCAL {l} - {v} VISITA` (uppercase, as the page title).
  - Line 2: `{Liga/Copa name} · {fecha corta}`.
  - Goals section: `Goles:` with one line per scorer and grouped minutes (`Juan 23', 67'`), suffixes `(p)` penal / `(ag)` autogol (autogoles listed); goal without minute listed bare. When NO event has a minute, `Goleadores:` with counts instead (`Juan 2 goles`). `Penales: {l}-{v}` line when shootout exists. `Sin goles.` for 0-0.
  - Last line: `${origin}/partidos/{id}` back-link.
- Button visible only on finalizado: public `PartidoPage` (below header) and manage `PartidoManagePage` (next to state buttons). Both share one helper; zero new API calls (all data already loaded; liga name resolved from `ligaId`).
- No new dependencies. No API changes.

## Capabilities

### New Capabilities
- (none)

### Modified Capabilities
- `publico-partidos`: finished match view gains a WhatsApp share button with the formatted resultado.
- `gestion-partido`: manage workspace gains the same share button on finalizado.

## Impact

- New `acsed-web/src/utils/compartir.ts` (pure `textoResultado`) + unit test; edits to `PartidoPage.tsx`, `PartidoManagePage.tsx` + render tests.
- Liga name lookup for line 2 (from `ligaId` via existing ligas service).
