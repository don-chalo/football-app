## Purpose

Asignacion de administradores de partidos a ligas/copas (relacion N:M) con scoping de escritura por liga, para que cada admin opere solo sus ligas y el login informe cuales son.

## ADDED Requirements

### Requirement: Asignacion N:M admin-liga
The system SHALL manage asignaciones (`userId`, `ligaId`, UNIQUE compuesto); `POST /ligas/:id/admins {userId}` and `DELETE /ligas/:id/admins/:userId` SHALL require `admin_usuarios`; only users with role `admin_partidos` can be assigned.

#### Scenario: Assign admin to liga
- **WHEN** an `admin_usuarios` posts an existing `admin_partidos` user to a liga
- **THEN** the system returns 201 with the asignacion.

#### Scenario: Duplicate or invalid assignee
- **WHEN** assigning the same user twice, a nonexistent user/liga, or a user with role `admin_usuarios`
- **THEN** the system returns 409 for duplicates and 404/422 for invalid targets.

#### Scenario: Minimum one admin per liga
- **WHEN** removing the last admin of a liga
- **THEN** the system returns 422 and keeps the asignacion.

### Requirement: Scoped writes per liga
Write endpoints under a liga scope (ligas, partidos, convocatorias, eventos) SHALL require the caller to be `admin_usuarios` (global) or an `admin_partidos` assigned to that liga; otherwise the system SHALL return 403. Global catalogs (equipos, jugadores) and user management keep their current rules.

#### Scenario: Assigned admin writes in own liga
- **WHEN** an `admin_partidos` assigned to liga A creates a partido in liga A
- **THEN** the system returns 201.

#### Scenario: Unassigned admin is forbidden
- **WHEN** an `admin_partidos` NOT assigned to liga B posts to liga B
- **THEN** the system returns 403.

#### Scenario: Admin with zero ligas cannot write
- **WHEN** an `admin_partidos` with no asignaciones attempts any scoped write
- **THEN** the system returns 403.

### Requirement: Login returns assigned ligas
`POST /auth/login` SHALL include `misLigas` (array of liga ids); for `admin_usuarios` it SHALL contain all liga ids.

#### Scenario: Login with assignments
- **WHEN** an `admin_partidos` assigned to two ligas logs in
- **THEN** the response includes exactly those two ids in `misLigas`.

### Requirement: Backfill and auto-assignment
On deploy, existing `admin_partidos` SHALL be assigned to all existing ligas; creating a liga SHALL auto-assign its creator (when creator is `admin_partidos`; `admin_usuarios` needs no assignment).

#### Scenario: Creator auto-assigned
- **WHEN** an `admin_partidos` creates a liga
- **THEN** the system creates the asignacion and the creator can immediately write in it.
