# Design: tarjetas

## Context

See proposal.md (Why). `TipoEvento` is closed (`gol|autogol|penal`) with an exhaustive switch in `equipoQueSuma` and two `else`-as-autogol traps (`golesFavorContra`, `jugadores.ts`). The sheet sends via generic `registrar(tipo)`; both cronologías render from `eventos`.

## Goals / Non-Goals

- Goals: card entry in the goal sheet, card-safe score math, card icons in both cronologías, card columns in both player tables.
- Non-Goals: accumulation logic, card-based suspensions, card stats beyond per-player counts, share-message changes (`compartir.ts` already filters goal types).

## Decisions

- **New tipos `amarilla`/`roja` in `domain/types.ts` + Zod enum + Mongoose enum** over `metadata`: first-class validation errors and readable cronología/sharing, consistent with existing types.
  - Alternative: `metadata: { tarjeta }` — rejected, splits type logic across two fields.
- **Explicit no-op branches** in `equipoQueSuma` (`case "amarilla": case "roja": return <non-team marker>`) and early-skip in `golesFavorContra`; `jugadores.ts` counts only `autogol` as autogol and adds `amarillas`/`rojas` fields to the row type + stats endpoints.
  - Alternative: filter cards before calling score functions — rejected, leaves the traps for the next type.
- **Sheet: `TIPOS` split into two rows** (`[gol,autogol,penal]` + `[amarilla,roja]`), `flex gap-2` with `flex-1` buttons; card buttons show a color chip + `T. AMARILLA`/`T. ROJA`; toast text by category (`Tarjeta registrada` vs `Gol registrado`).
- **Icons**: new `TarjetaAmarillaIcon`/`TarjetaRojaIcon` (rounded-rect SVG, fixed fills `#FACC15`/`#DC2626`, `className` sizing like other icons); fix `SoccerBall` missing-space `className` bug and add effective sizing via `className` (CSS overrides width/height attrs).
- **Cronología rows**: per-type icon component (`ball` for gol/penal/autogol, card icon otherwise) with `aria-label` ("Gol de X" / "Tarjeta amarilla para X"), minute appended when present; shared helper used by `CargaVivo` and `PartidoPage` to avoid drift.
- **Quitar sheet**: text rows (`T. amarilla 23'`) reusing the existing row, no icons per user decision.
- **Row totals**: `TA`/`TR` appended when >0 (`G 2 · TA 1`); `tieneEventos` already generic over `textoConteos`.
- **Player tables**: `TA`/`TR` columns after autogoles in `JugadoresTab` (LigaDetailPage) and `EstadisticasPage` players; sortable? No — display only (user asked only to show).

## Risks / Trade-offs

- Existing DB eventos unaffected (additive enum); old app versions would throw on unknown types via the exhaustive switch — acceptable, web and API deploy together.
- `FilaJugador` shape grows by 2 numeric fields — additive, old clients ignore unknown JSON keys.
