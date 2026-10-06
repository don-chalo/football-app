## MODIFIED Requirements

### Requirement: Single convocatoria list in match workspace
The admin match workspace SHALL show exactly one convocatoria list ("Convocatoria y goles"), visible in every estado (`programado`, `en_juego`, `finalizado`, `suspendido`); there SHALL be no separate "Convocados" card. In `suspendido` the list SHALL be read-only (rows do not open the sheet, no "+ Agregar jugador", no goal entry). Adding jugadores to the convocatoria SHALL accept multiple jugadores per sheet session in a single request (bulk `{ equipoId, jugadorIds[] }` with a per-request cap); duplicate jugadores from concurrent adds SHALL be skipped and reported as omitted, never failing the whole batch. There is no fixed jugador-equipo membership: the only invariant is one jugador, one equipo per partido.

#### Scenario: Workspace has one list
- **WHEN** an admin opens a partido workspace in any estado
- **THEN** they see a single player list grouped by equipo and no separate Convocados section.

#### Scenario: Suspendido workspace without actions
- **WHEN** an admin opens a `suspendido` partido workspace
- **THEN** the list is visible but tapping a player does nothing and no add controls are offered.

#### Scenario: Concurrent duplicate is skipped
- **WHEN** a bulk add includes a jugador convocado by another operator seconds earlier
- **THEN** the rest of the batch is created and the response reports that jugador as omitted.
