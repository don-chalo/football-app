## MODIFIED Requirements

### Requirement: Single convocatoria list in match workspace
The admin match workspace SHALL show exactly one convocatoria list ("Convocatoria y goles"), visible in every estado (`programado`, `en_juego`, `finalizado`, `suspendido`); there SHALL be no separate "Convocados" card. In `suspendido` the list SHALL be read-only (rows do not open the sheet, no "+ Agregar jugador", no goal entry).

#### Scenario: Workspace has one list
- **WHEN** an admin opens a partido workspace in any estado
- **THEN** they see a single player list grouped by equipo and no separate Convocados section.

#### Scenario: Suspendido workspace without actions
- **WHEN** an admin opens a `suspendido` partido workspace
- **THEN** the list is visible but tapping a player does nothing and no add controls are offered.

## ADDED Requirements

### Requirement: Suspend programado partido
The workspace of a `programado` partido SHALL offer "Suspender" with inline confirm next to "Poner en juego"; suspending SHALL set estado `suspendido`. Fixture and lists SHALL show `suspendido` partidos attenuated with a neutral badge; "Poner en juego" SHALL NOT be offered in `suspendido`.

#### Scenario: Suspend with confirm
- **WHEN** an admin confirms Suspender on a `programado` partido
- **THEN** the estado becomes `suspendido` and the workspace loses its action buttons.
