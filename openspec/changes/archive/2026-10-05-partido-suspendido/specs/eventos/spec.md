## MODIFIED Requirements

### Requirement: Goal events only from present convocados
The system SHALL record eventos with (`partido_id`, `jugador_id`, `equipo_id`, `tipo` `gol` | `autogol` | `penal`, nullable `minuto`, nullable `metadata` JSON for future types like asistencias/tarjetas); eventos SHALL only be created for jugadores convocados-presentes in that partido and team; goles SHALL be recorded live while estado is `en_juego` and editable while `finalizado` for corrections; no eventos SHALL be recorded while estado is `programado` or `suspendido`; all writes require admin role (scoped by assignment for `admin_partidos`, see asignaciones).

#### Scenario: Live goal entry
- **WHEN** an admin posts a `gol` for a convocado-presente jugador during `en_juego`
- **THEN** the system stores the evento with status 201.

#### Scenario: Goal from absent rejected
- **WHEN** an admin posts a gol for a jugador marked `ausente` or not convocado
- **THEN** the system returns 422.

#### Scenario: Goal in suspendido rejected
- **WHEN** an admin posts a gol for a `suspendido` partido
- **THEN** the system returns 422.
