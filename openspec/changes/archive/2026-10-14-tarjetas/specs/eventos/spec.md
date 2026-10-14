## MODIFIED Requirements

### Requirement: Goal events only from present convocados
The system SHALL record eventos with (`partido_id`, `jugador_id`, `equipo_id`, `tipo` `gol` | `autogol` | `penal` | `amarilla` | `roja`, nullable `minuto`, nullable `metadata` JSON); eventos SHALL only be created for jugadores convocados-presentes in that partido and team; eventos SHALL be recorded live while estado is `en_juego` and editable while `finalizado` for corrections; no eventos SHALL be recorded while estado is `programado` or `suspendido`; all writes require admin role (scoped by assignment for `admin_partidos`, see asignaciones).

#### Scenario: Live goal entry
- **WHEN** an admin posts a `gol` for a convocado-presente jugador during `en_juego`
- **THEN** the system stores the evento with status 201.

#### Scenario: Goal from absent rejected
- **WHEN** an admin posts a gol for a jugador marked `ausente` or not convocado
- **THEN** the system returns 422.

#### Scenario: Goal in suspendido rejected
- **WHEN** an admin posts a gol for a `suspendido` partido
- **THEN** the system returns 422.

#### Scenario: Card entry shares goal validation
- **WHEN** an admin posts an `amarilla` for a convocado-presente jugador during `en_juego`
- **THEN** the system stores the evento with status 201; the same 422 rules as goals apply otherwise.

### Requirement: Autogol and penal semantics
`autogol` SHALL add +1 GF to the rival equipo and +1 GC to the jugador's equipo, count +1 in the jugador's autogoles stat and NOT in goleadores; `penal` (in-match penalty goal) SHALL count like `gol` for marcador and goleadores.

#### Scenario: Autogol accounting
- **WHEN** Juan (EquipoA) scores an autogol against EquipoB
- **THEN** the marcador shows +1 for EquipoB and Juan's autogoles stat increments.

#### Scenario: Extensibility preserved
- **WHEN** a future event type (e.g. asistencia) is introduced
- **THEN** existing gol|autogol|penal eventos remain valid and readable (additive change).

### Requirement: Card semantics
`amarilla` and `roja` SHALL NOT change the marcador, GF/GC of either equipo, goleadores or autogoles; each SHALL count +1 in the jugador's `amarillas`/`rojas` stat. Recording two `amarilla` for the same jugador SHALL store two eventos with no automatic `roja` equivalence.

#### Scenario: Card leaves score untouched
- **WHEN** an admin records an `amarilla` in a 1-0 partido
- **THEN** the marcador stays 1-0 and the jugador's `amarillas` stat increments.
