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
The system SHALL advance estado programado→en_juego→finalizado (never back), record minimal shootout + clasificado, and allow event correction in finalizado.

#### Scenario: Start and finish
- **WHEN** an admin starts a programmed match
- **THEN** the live-load view becomes available; finishing locks new goals except corrections.

### Requirement: Administrative partido list shows resultado
The administrative list of partidos for a liga SHALL display each partido's calculated local and visiting goal totals. The displayed resultado SHALL use the same event-derived calculation as the public partido list and partido detail.

#### Scenario: Admin reviews liga fixture
- **WHEN** an admin opens the administrative partidos list for a liga containing a scoring match
- **THEN** that match row displays its calculated local and visiting goal totals without requiring the admin to open the match workspace.
