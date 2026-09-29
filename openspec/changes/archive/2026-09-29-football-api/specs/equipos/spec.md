## Purpose

Global catalog of teams with minimal data, reusable across ligas and partidos since the same barrial teams play repeatedly during the year.

## ADDED Requirements

### Requirement: Equipo model with unique name
The system SHALL manage equipos with `id` and `nombre` only; `nombre` SHALL be UNIQUE case-insensitive and required.

#### Scenario: Create equipo
- **WHEN** an admin posts an equipo with a unique nombre
- **THEN** the system returns 201 with id and nombre.

#### Scenario: Duplicate equipo rejected
- **WHEN** an admin posts an equipo whose nombre matches an existing one case-insensitively
- **THEN** the system returns 409.

### Requirement: Public listing and admin CRUD
`GET /equipos` SHALL be public; `POST/PUT/PATCH/DELETE /equipos` SHALL require admin role.

#### Scenario: Public list equipos
- **WHEN** an anonymous client calls `GET /equipos`
- **THEN** the system returns the equipo list with status 200.
