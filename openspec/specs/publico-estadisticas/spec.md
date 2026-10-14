# publico-estadisticas Specification

## Purpose

Estadisticas publicas calculadas por el API: tabla de equipos, jugadores y duelos directos, con filtros.

## Requirements

### Requirement: Tabla por equipo
The system SHALL show PJ/PG/PE/PP/GF/GC/Dif/%/Pts ordered Pts>Dif>GF, with filters for ligas/copas and date range (default current year, max 1 year). `%` (rendimiento) SHALL show `(3·PG+PE)/(3·PJ)·100` with one decimal ("–" when PJ is 0) and be sortable without changing the default order; its header SHALL carry an info icon with tooltip and accessible label "% de rendimiento".

#### Scenario: Filter by year
- **WHEN** a visitor changes the date range
- **THEN** the table reloads; ranges over 1 year show the API 422 message.

#### Scenario: Tabla shows rendimiento
- **WHEN** a visitor opens the team table
- **THEN** each row shows % left of Pts, and tapping the % header sorts by rendimiento.

### Requirement: Jugadores, goleadores y autogoles
The system SHALL show player stats (PJ/PG/PE/PP, goles, autogoles, amarillas, rojas, convocados, ausentes, %inasistencia) with optional equipo/partido filters, defaulting to a goleadores view ordered by goles. Cards SHALL NOT count as goles or autogoles. A sortable `%` (rendimiento) column SHALL appear right of PP, showing `(3·PG+PE)/(3·PJ)·100` with one decimal ("–" when PJ is 0); its header SHALL carry an info icon with tooltip and accessible label "% de rendimiento". Sorting by `%` SHALL be available without changing the default order. Below `sm` the table SHALL show Jugador/PJ/PG/PE/PP/Goles (% added from `sm`), hiding Autogoles/TA/TR/Convocado/Ausencias below `md`, with a tappable row expansion revealing the hidden columns.

#### Scenario: Goleadores view
- **WHEN** a visitor opens the scorers tab
- **THEN** players are ordered by goles (penal counts, autogol does not) with autogoles shown separately.

#### Scenario: Players show rendimiento
- **WHEN** a visitor opens the players tab
- **THEN** each row shows % right of PP, and tapping the % header sorts by rendimiento.

#### Scenario: Players show cards
- **WHEN** a visitor opens a players table for matches with recorded cards
- **THEN** each row shows that player's amarillas and rojas counts in dedicated columns.

#### Scenario: Players table expands on phone
- **WHEN** a visitor opens a players table on a 360px phone
- **THEN** hidden columns are revealed by tapping the player row.

### Requirement: Historial entre dos equipos
The system SHALL show head-to-head (PJ, wins A, draws, wins B, GF) plus the match list for a selected pair.

#### Scenario: Select two teams
- **WHEN** a visitor picks equipo A and B
- **THEN** they see aggregates and the underlying matches.
