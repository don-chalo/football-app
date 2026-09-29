## Purpose

Manual fixture management for partidos between two equipos within a liga, supporting league dates, free-form copa phases, linked home/away ties and minimal shootout data.

## ADDED Requirements

### Requirement: Partido model
The system SHALL manage partidos with `liga_id`, `equipo_local_id`, `equipo_visitante_id`, `fecha`, `estado` (`programado` default | `en_juego` | `finalizado`), free-text `fase` (e.g. "fecha 3", "semi", "previa"), optional linked tie (`partido_ida_id` / `partido_vuelta_id` or llave id) for copa `ida_vuelta`, and minimal shootout fields (`penales_local`, `penales_visita`, nullable).

#### Scenario: Create programmed partido
- **WHEN** an admin posts a partido with liga, two different equipos and fecha
- **THEN** the system creates it with estado `programado` and status 201.

#### Scenario: Same equipo rejected
- **WHEN** an admin posts a partido with local equal to visita
- **THEN** the system returns 422.

### Requirement: State transitions
The system SHALL allow transitions `programado -> en_juego -> finalizado` only; it SHALL reject any transition back to `programado`; correction of a `finalizado` partido SHALL happen by editing its eventos, not by changing estado; `PATCH /partidos/{id}/estado` SHALL drive transitions.

#### Scenario: Advance to en_juego
- **WHEN** an admin patches a `programado` partido to `en_juego`
- **THEN** the system updates the estado with status 200.

#### Scenario: Back to programado rejected
- **WHEN** an admin patches an `en_juego` or `finalizado` partido to `programado`
- **THEN** the system returns 422 and keeps the current estado.

### Requirement: Copa ties and shootouts
For copa ligas the system SHALL support linked ida/vuelta partidos and store shootout scores (`penales_local`, `penales_visita`) at minimal level (winning team only, no per-kick detail); shootout goals SHALL NOT count for marcador, goleadores or GF/GC.

#### Scenario: Tie defined by shootout
- **WHEN** a copa tie ends level on aggregate and penales 4-3 are recorded
- **THEN** the system stores the shootout score and marks the winning equipo as classified without altering goal statistics.

### Requirement: Public read and admin write
`GET /partidos` (filterable by `liga_id`) and `GET /partidos/{id}` SHALL be public; all writes SHALL require admin role.

#### Scenario: Public partido detail
- **WHEN** an anonymous client calls `GET /partidos/{id}`
- **THEN** the system returns the partido with equipos, estado, marcador calculado and eventos.
