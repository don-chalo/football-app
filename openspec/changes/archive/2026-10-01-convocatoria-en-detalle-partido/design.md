## Context

`PartidoPage` already receives `convocatorias`, including `jugadorId`, `equipoId` and `estado`, alongside the existing player and team name maps. The missing piece is presentation: a public squad section above `Goleadores`, arranged by local and visiting equipo. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**

- Expose the existing convocatoria data in the public match detail.
- Preserve the current section order below the new squad section.
- Keep two readable columns on mobile without horizontal scrolling.
- Distinguish ausente players without hiding cited squad members.

**Non-Goals:**

- No API, backend or convocatoria-management changes.
- No squad editing, filtering, searching or sorting controls.
- No changes to marcador, goleadores or chronology behavior.

## Decisions

### Reuse detail convocatorias without another request

The squad section will use the convocatoria collection already included in partido detail, partitioned by `localId` and `visitaId`. Existing name maps will resolve display names.

Alternative considered: add a dedicated convocatoria endpoint or request. Rejected because the data is already available and another request would complicate polling.

### Fixed two-column presentation

The section will use local and visiting columns, each headed by its equipo name. Player order will follow the existing convocatoria response order.

Alternative considered: a single stacked list grouped by team headings. Rejected because the user requested a side-by-side comparison and the squad data naturally partitions into two equipos.

### Preserve absent players with muted styling

Ausente players will remain listed with subdued styling and an explicit ausente marker.

Alternative considered: showing only present players. Rejected because the agreed behavior is to preserve visibility into cited-but-absent players.

### Explicit empty states

An empty match-level squad will show that no convocatoria is loaded. An equipo column without convocatorias will show that it has no players.

Alternative considered: hiding the section when empty. Rejected because an explicit empty state avoids ambiguity between loading, missing data and an empty squad.

## Risks / Trade-offs

- [Risk] Long names may squeeze narrow columns at 360px → Mitigation: allow wrapping within each column and avoid fixed-width player cells.
- [Risk] A missing player or equipo name mapping could render an unclear placeholder → Mitigation: reuse the detail page's existing name-resolution fallbacks.
- [Risk] Large squads increase vertical scrolling → Mitigation: keep the presentation compact and retain the requested section order.
- [Risk] Separate polling cycles could briefly show squad and match data from different refreshes → Mitigation: treat each poll response atomically and do not merge players across responses.

## Migration Plan

1. Deploy the frontend change; no backend deployment is required.
2. Roll back by restoring the previous `PartidoPage` presentation if needed.
3. No data migration is required.
