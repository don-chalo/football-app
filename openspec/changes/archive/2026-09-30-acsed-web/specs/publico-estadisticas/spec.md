## Purpose

Estadisticas publicas calculadas por el API: tabla de equipos, jugadores y duelos directos, con filtros.

## ADDED Requirements

### Requirement: Tabla por equipo
The system SHALL show PJ/PG/PE/PP/GF/GC/Dif/Pts ordered Pts>Dif>GF, with filters for ligas/copas and date range (default current year, max 1 year).

#### Scenario: Filter by year
- **WHEN** a visitor changes the date range
- **THEN** the table reloads; ranges over 1 year show the API 422 message.

### Requirement: Jugadores, goleadores y autogoles
The system SHALL show player stats (PJ/PG/PE/PP, goles, autogoles, convocados, ausentes, %inasistencia) with optional equipo/partido filters, defaulting to a goleadores view ordered by goles.

#### Scenario: Goleadores view
- **WHEN** a visitor opens the scorers tab
- **THEN** players are ordered by goles (penal counts, autogol does not) with autogoles shown separately.

### Requirement: Historial entre dos equipos
The system SHALL show head-to-head (PJ, wins A, draws, wins B, GF) plus the match list for a selected pair.

#### Scenario: Select two teams
- **WHEN** a visitor picks equipo A and B
- **THEN** they see aggregates and the underlying matches.
