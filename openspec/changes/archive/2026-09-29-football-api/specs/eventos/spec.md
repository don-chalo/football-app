## Purpose

Per-match squads and extensible match events, recording who played for which team and every goal with rules that keep statistics consistent.

## ADDED Requirements

### Requirement: Convocatorias with presence
The system SHALL manage convocatorias per partido as (`partido_id`, `jugador_id`, `equipo_id`, `estado` `convocado` | `ausente`); default on association SHALL be `convocado` (assumed present); `ausente` means cited but did not show; the same jugador SHALL NOT be convocado for both equipos of the same partido.

#### Scenario: Convocar jugador
- **WHEN** an admin associates a global jugador to EquipoA of a partido
- **THEN** the system stores the convocatoria as `convocado` with status 201.

#### Scenario: Mark ausente
- **WHEN** an admin patches a convocatoria to `ausente`
- **THEN** the system updates it and excludes that jugador from goal validation.

#### Scenario: Double convocatoria rejected
- **WHEN** an admin tries to convocar the same jugador for both equipos of one partido
- **THEN** the system returns 422.

### Requirement: Goal events only from present convocados
The system SHALL record eventos with (`partido_id`, `jugador_id`, `equipo_id`, `tipo` `gol` | `autogol` | `penal`, nullable `minuto`, nullable `metadata` JSON for future types like asistencias/tarjetas); eventos SHALL only be created for jugadores convocados-presentes in that partido and team; goles SHALL be recorded live while estado is `en_juego` and editable while `finalizado` for corrections; all writes require admin role.

#### Scenario: Live goal entry
- **WHEN** an admin posts a `gol` for a convocado-presente jugador during `en_juego`
- **THEN** the system stores the evento with status 201.

#### Scenario: Goal from absent rejected
- **WHEN** an admin posts a gol for a jugador marked `ausente` or not convocado
- **THEN** the system returns 422.

### Requirement: Autogol and penal semantics
`autogol` SHALL add +1 GF to the rival equipo and +1 GC to the jugador's equipo, count +1 in the jugador's autogoles stat and NOT in goleadores; `penal` (in-match penalty goal) SHALL count like `gol` for marcador and goleadores.

#### Scenario: Autogol accounting
- **WHEN** Juan (EquipoA) scores an autogol against EquipoB
- **THEN** the marcador shows +1 for EquipoB and Juan's autogoles stat increments.

#### Scenario: Extensibility preserved
- **WHEN** a future event type (e.g. asistencia) is introduced
- **THEN** existing gol|autogol|penal eventos remain valid and readable (additive change).
