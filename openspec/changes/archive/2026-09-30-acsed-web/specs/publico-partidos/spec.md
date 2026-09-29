## Purpose

Ficha publica de partidos con marcador calculado y auto-refresco para seguir resultados en vivo.

## ADDED Requirements

### Requirement: Lista y ficha de partido
The system SHALL list partidos (filterable by liga and estado) and show a public match view with equipos, fecha, fase, estado, calculated marcador, shootout if present, and goal list.

#### Scenario: Visitor opens match
- **WHEN** a visitor opens `/partidos/:id`
- **THEN** they see marcador, scorer list with minute when present, and penales score without attributing them to players.

### Requirement: Auto-refresh polling
Public match views SHALL re-fetch every 10–15s (fixed), pause when the tab is hidden, and refresh immediately after the viewer's own admin mutation.

#### Scenario: Goal appears without reload
- **WHEN** a goal is registered while a visitor watches the match view
- **THEN** the new marcador appears within the next poll tick without manual reload.
