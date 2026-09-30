## Context

`CargaVivo` currently combines a full present-player list, immediate goal registration, a global event chronology and one bottom-sheet add flow. Mobile correction requires scrolling through unrelated players and events. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**

- Preserve the established two-tap add flow and undo behavior.
- Display compact, locally derived per-player totals.
- Provide player-scoped deletion without exposing every event by default.
- Keep the correction UI usable at mobile width without nested interactive controls.

**Non-Goals:**

- No backend or evento API changes.
- No change to goal, autogol, in-match penal or shootout semantics.
- No editing of evento type or minuto; correction remains delete followed by re-entry where needed.
- No roster search, virtualization or real-time push.

## Decisions

### Derive totals from already-loaded eventos

Per-player `G`, `AG` and `P` totals will be calculated from the evento collection already supplied to the live-load component. Only nonzero totals will be displayed.

Alternative considered: request separate per-player aggregates. Rejected because it would add unnecessary requests and complicate polling synchronization.

### One bottom sheet with add and correction modes

The existing bottom sheet will support:

- Add mode: player, `GOL`, `AUTOGOL`, `PENAL` and optional minute.
- Correction mode: only the selected player's eventos, each with delete.

Alternative considered: separate add and correction sheets. Rejected because it would duplicate open/close behavior, error handling and refresh coordination.

### Separate sibling controls instead of nested buttons

Tapping the player row will retain the add action. Removal will use a separate sibling control rather than placing one button inside another.

Alternative considered: literally adding independent `+` and `-` buttons inside the current player button. Rejected because nested interactive controls harm accessibility and complicate touch behavior.

### Collapse the global chronology

The full recent-event list will remain available but collapsed by default. Player-scoped correction will provide the fastest path to an individual deletion.

Alternative considered: removing the global chronology. Rejected because it remains useful for auditing the complete sequence of match events.

## Risks / Trade-offs

- [Risk] Abbreviated `G`, `AG` and `P` labels may confuse new users → Mitigation: retain full `GOL`, `AUTOGOL` and `PENAL` labels in the sheet and event rows.
- [Risk] Collapsing the chronology may hide a recently added event → Mitigation: retain the immediate undo toast and immediate refresh after the admin's own mutation.
- [Risk] Row-level controls may crowd narrow screens → Mitigation: show removal only when useful, keep targets at least 44px, and preserve wrapping without horizontal scrolling.
- [Risk] Polling may refresh eventos while correction is open → Mitigation: scope deletion to stable evento IDs and refresh the visible totals after each mutation.

## Migration Plan

1. Deploy the frontend change; no backend deployment is required.
2. Roll back by restoring the previous live-load component if its behavior regresses.
3. No data migration is required because totals remain derived from existing eventos.
