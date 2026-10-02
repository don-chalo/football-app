# gestion-partido Specification

## Purpose

Creacion y conduccion de partidos por el admin: alta, cambios de estado, penales y correcciones.

## Requirements

### Requirement: Create and edit partido
The system SHALL create partidos (liga, local, visita, fecha, fase libre, ida link) defaulting to programado, and edit fecha/fase/llave; same-team selection SHALL be blocked client-side and API 422 shown.

#### Scenario: Create match
- **WHEN** an admin creates a partido with two different equipos
- **THEN** it appears as programado in the liga fixture.

### Requirement: State transitions and shootout
The system SHALL advance estado programado→en_juego→finalizado (never back), record `inicioEn` on start (only if null) and `finEn` on finish, record minimal shootout + clasificado, and allow event correction in finalizado. Starting SHALL require `now >= fecha` (API rejects earlier starts with 400; web disables the button with an availability notice).

#### Scenario: Start and finish
- **WHEN** an admin starts a programmed match past its scheduled datetime
- **THEN** the live-load view becomes available with a running server-anchored clock; finishing locks new goals except corrections and freezes the clock.

### Requirement: Administrative partido list shows resultado
The administrative list of partidos for a liga SHALL display each partido's calculated local and visiting goal totals. The displayed resultado SHALL use the same event-derived calculation as the public partido list and partido detail.

#### Scenario: Admin reviews liga fixture
- **WHEN** an admin opens the administrative partidos list for a liga containing a scoring match
- **THEN** that match row displays its calculated local and visiting goal totals without requiring the admin to open the match workspace.

### Requirement: Single convocatoria list in match workspace
The admin match workspace SHALL show exactly one convocatoria list ("Convocatoria y goles"), visible in every estado (`programado`, `en_juego`, `finalizado`); there SHALL be no separate "Convocados" card.

#### Scenario: Workspace has one list
- **WHEN** an admin opens a partido workspace in any estado
- **THEN** they see a single player list grouped by equipo and no separate Convocados section.
