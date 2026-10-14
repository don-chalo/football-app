# Design: compartir-whatsapp

## Context

See proposal.md (Why). `PartidoPage.tsx` already loads full `PartidoDetalle` (marcador, eventos with tipo/minuto, penales) plus `mapaEquipos`/`mapaJugadores`; `PartidoManagePage.tsx` loads the same detalle. No new data needed except the liga name for line 2 (`detalle.ligaId` → existing ligas service).

## Goals / Non-Goals

- Goals: one-tap share on finalizado in public view + manage workspace; pure helper fully unit-tested.
- Non-Goals: fixed destination number; sharing non-finished partidos; API changes; new dependencies.

## Decisions

- **New pure helper `utils/compartir.ts: textoResultado(detalle, nombres, origin)`** over inline code in two pages: single format source, trivially unit-testable without Router/fetch mocks.
  - Input: `PartidoDetalle`, `{ equipos: Map, jugadores: Map, ligaNombre: string }`, `origin`.
  - Grouping: by jugadorId preserving first-goal order; minutes joined `23', 67'`; suffix `(p)` penal / `(ag)` autogol (autogol counts toward its equipo's tally as today); minute-less goal listed bare.
  - No minute on ANY event → `Goleadores:` counts block (`1 gol` / `N goles`), reusing the same aggregation the page already shows.
  - `wa.me/?text=` link built at the call site with `encodeURIComponent` (keeps helper URL-agnostic and test-friendly).
- **Liga name via existing `services.ligas.obtener(ligaId)`** in both pages (one extra cached fetch each) over embedding the name in the detalle API: no backend change.
  - Alternative: extend `PartidoDetalle` API — rejected (backend change for display-only data).
- **Button placement**: icon-link (`WhatsappIcon`, `aria-label` + `title` "Compartir por WhatsApp") at the right end of the match-date row in both `PartidoPage` and `PartidoManagePage`, gated on `estado === "finalizado"`; compact width (`min-w-11`), `min-h-11` for the 44px rule.
- **Dedicated `components/BotonCompartir.tsx`** holding the liga-name fetch state: returning `null` on non-finalizado and keeping its `setState` inside the child, so the parent page does not re-render (the isolated-clock-tick test counts parent renders).
  - Alternative: `useState`+`useEffect` in each page — rejected, it broke `PartidoManageRender` tick isolation.
- **Anchor `<a target="_blank" rel="noreferrer">`** styled as button (consistent with Instagram footer link), `min-h-11` for the 44px rule.

## Risks / Trade-offs

- `wa.me` requires the WhatsApp app/site — on desktop without WhatsApp the link dead-ends at WhatsApp Web prompt; acceptable, standard practice.
- Very long scorer lists could approach URL length limits — a football match won't realistically hit them.
