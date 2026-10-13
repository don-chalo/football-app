## MODIFIED Requirements

### Requirement: Tabla por equipo
The system SHALL show PJ/PG/PE/PP/GF/GC/Dif/%/Pts ordered Pts>Dif>GF, with filters for ligas/copas and date range (default current year, max 1 year). `%` (rendimiento) SHALL show `(3·PG+PE)/(3·PJ)·100` with one decimal ("–" when PJ is 0) and be sortable without changing the default order; its header SHALL carry an info icon with tooltip and accessible label "% de rendimiento".

#### Scenario: Filter by year
- **WHEN** a visitor changes the date range
- **THEN** the table reloads; ranges over 1 year show the API 422 message.

#### Scenario: Tabla shows rendimiento
- **WHEN** a visitor opens the team table
- **THEN** each row shows % left of Pts, and tapping the % header sorts by rendimiento.

### Requirement: Jugadores, goleadores y autogoles
The system SHALL show player stats (PJ/PG/PE/PP, goles, autogoles, convocados, ausentes, %inasistencia) with optional equipo/partido filters, defaulting to a goleadores view ordered by goles. A sortable `%` (rendimiento) column SHALL appear right of PP, showing `(3·PG+PE)/(3·PJ)·100` with one decimal ("–" when PJ is 0); its header SHALL carry an info icon with tooltip and accessible label "% de rendimiento". Sorting by `%` SHALL be available without changing the default order.

#### Scenario: Goleadores view
- **WHEN** a visitor opens the scorers tab
- **THEN** players are ordered by goles (penal counts, autogol does not) with autogoles shown separately.

#### Scenario: Players show rendimiento
- **WHEN** a visitor opens the players tab
- **THEN** each row shows % right of PP, and tapping the % header sorts by rendimiento.
