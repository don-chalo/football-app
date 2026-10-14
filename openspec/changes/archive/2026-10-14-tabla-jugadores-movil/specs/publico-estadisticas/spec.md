## MODIFIED Requirements

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
