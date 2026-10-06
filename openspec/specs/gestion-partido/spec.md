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
The system SHALL advance estado programado→en_juego→finalizado (never back), record `inicioEn` on start (only if null) and `finEn` on finish, record minimal shootout + clasificado, and allow event correction in finalizado. Starting SHALL require `now >= fecha` (API rejects earlier starts with 400; web disables the button with an availability notice). Finishing from the workspace SHALL require inline confirm (Finalizar → Confirmar/No); suspending SHALL keep its existing inline confirm.

#### Scenario: Start and finish
- **WHEN** an admin starts a programmed match past its scheduled datetime
- **THEN** the live-load view becomes available with a running server-anchored clock; finishing locks new goals except corrections and freezes the clock.

#### Scenario: Finish requires confirm
- **WHEN** an admin taps Finalizar on an `en_juego` partido
- **THEN** the UI asks Confirmar/No first and only confirms on Confirmar.

### Requirement: Administrative partido list shows resultado
The administrative list of partidos for a liga SHALL display each partido's calculated local and visiting goal totals. The displayed resultado SHALL use the same event-derived calculation as the public partido list and partido detail.

#### Scenario: Admin reviews liga fixture
- **WHEN** an admin opens the administrative partidos list for a liga containing a scoring match
- **THEN** that match row displays its calculated local and visiting goal totals without requiring the admin to open the match workspace.

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

### Requirement: Suspend programado partido
The workspace of a `programado` partido SHALL offer "Suspender" with inline confirm next to "Poner en juego"; suspending SHALL set estado `suspendido`. Fixture and lists SHALL show `suspendido` partidos attenuated with a neutral badge; "Poner en juego" SHALL NOT be offered in `suspendido`.

#### Scenario: Suspend with confirm
- **WHEN** an admin confirms Suspender on a `programado` partido
- **THEN** the estado becomes `suspendido` and the workspace loses its action buttons.
