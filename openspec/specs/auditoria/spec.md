# auditoria Specification

## Purpose

Trazabilidad de quien creo ligas y partidos y quien cargo cada gol, visible en lectura para la ficha de partido de acsed-web (auditoria Nivel 2).

## Requirements

### Requirement: Actor stored on writes
Liga, partido, convocatoria and evento records SHALL store `createdBy {userId, username}` (username as snapshot at write time); the actor SHALL be taken from the authenticated token, never from client input.

#### Scenario: Goal records its loader
- **WHEN** planillero `plan` (admin_partidos) registers a gol
- **THEN** the evento stores `createdBy {userId: <plan id>, username: "plan"}`.

### Requirement: Actor visible on reads
Detail endpoints (`GET /ligas/:id`, `GET /partidos/:id` with its convocatorias/eventos) SHALL expose `createdBy` alongside existing `createdAt`; list endpoints MAY omit it.

#### Scenario: Match view shows loaders
- **WHEN** a client fetches a partido detail
- **THEN** each evento includes who loaded it and when, enabling "plan cargó gol de Pedro 21:43".

### Requirement: Existing records without actor
Records created before this change SHALL expose `createdBy: null` (no backfill of actors); new writes SHALL always include it.

#### Scenario: Legacy evento
- **WHEN** reading an evento created before the change
- **THEN** `createdBy` is null and the read still succeeds.
