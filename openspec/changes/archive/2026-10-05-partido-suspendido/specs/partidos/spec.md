## MODIFIED Requirements

### Requirement: Partido model
The system SHALL manage partidos with `liga_id`, `equipo_local_id`, `equipo_visitante_id`, `fecha`, `estado` (`programado` default | `en_juego` | `finalizado` | `suspendido` terminal), free-text `fase` (e.g. "fecha 3", "semi", "previa"), optional linked tie (`partido_ida_id` / `partido_vuelta_id` or llave id) for copa `ida_vuelta`, and minimal shootout fields (`penales_local`, `penales_visita`, nullable).

#### Scenario: Create programmed partido
- **WHEN** an admin posts a partido with liga, two different equipos and fecha
- **THEN** the system creates it with estado `programado` and status 201.

#### Scenario: Same equipo rejected
- **WHEN** an admin posts a partido with local equal to visita
- **THEN** the system returns 422.

### Requirement: State transitions
The system SHALL allow transitions `programado -> en_juego -> finalizado` and `programado -> suspendido` only; `suspendido` SHALL admit no outgoing transition; it SHALL reject any transition back to `programado`; correction of a `finalizado` partido SHALL happen by editing its eventos, not by changing estado; `PATCH /partidos/{id}/estado` SHALL drive transitions.

#### Scenario: Advance to en_juego
- **WHEN** an admin patches a `programado` partido to `en_juego`
- **THEN** the system updates the estado with status 200.

#### Scenario: Back to programado rejected
- **WHEN** an admin patches an `en_juego` or `finalizado` partido to `programado`
- **THEN** the system returns 422 and keeps the current estado.

#### Scenario: Suspend programmed partido
- **WHEN** an admin patches a `programado` partido to `suspendido`
- **THEN** the system updates the estado with status 200.

#### Scenario: Suspendido is terminal
- **WHEN** an admin patches a `suspendido` partido to any estado
- **THEN** the system returns 422 and keeps `suspendido`.
