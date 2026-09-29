# ligas Specification

## Purpose

Management of barrial leagues where each liga is a tournament with a fixed format (round-robin or knockout), forming the root of partidos and statistics.

## Requirements

### Requirement: Liga model with format
The system SHALL manage ligas with `nombre`, `formato` (`liga` | `copa`) and for copa a flag `ida_vuelta` (boolean) defined at liga level; `nombre` is required.

#### Scenario: Create liga format
- **WHEN** an admin creates a liga with formato `liga`
- **THEN** the system creates it with status 201 and no copa config required.

#### Scenario: Create copa with ida_vuelta
- **WHEN** an admin creates a liga with formato `copa` and `ida_vuelta=true`
- **THEN** the system stores the flag and returns 201.

### Requirement: Public listing and admin CRUD
`GET /ligas` and `GET /ligas/{id}` SHALL be public; `POST/PUT/PATCH/DELETE /ligas` SHALL require admin role (scoped by assignment for `admin_partidos`, see asignaciones).

#### Scenario: Public list
- **WHEN** an anonymous client calls `GET /ligas`
- **THEN** the system returns all ligas with their formato.

#### Scenario: Admin creates liga
- **WHEN** an admin posts a valid liga
- **THEN** the system returns 201 with the created liga including its id.
