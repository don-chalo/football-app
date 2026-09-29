# jugadores Specification

## Purpose

Global catalog of players with minimal data, reusable across equipos and partidos since players can represent different teams over the year.

## Requirements

### Requirement: Jugador model with unique name
The system SHALL manage jugadores with `id` and `nombre` only; `nombre` SHALL be UNIQUE case-insensitive and required.

#### Scenario: Create jugador
- **WHEN** an admin posts a jugador with a unique nombre
- **THEN** the system returns 201 with id and nombre.

#### Scenario: Duplicate jugador rejected
- **WHEN** an admin posts a jugador whose nombre matches an existing one case-insensitively
- **THEN** the system returns 409.

### Requirement: Bulk creation
The system SHALL support bulk creation via `POST /jugadores:bulk` (or equivalent) accepting a list of nombres and creating all valid ones, reporting per-item errors for duplicates without rolling back the valid ones, OR document atomic behavior explicitly.

#### Scenario: Bulk create several jugadores
- **WHEN** an admin posts a list of three unique nombres
- **THEN** the system creates all three and returns 201 with their ids.

### Requirement: Public listing and admin CRUD
`GET /jugadores` SHALL be public; `POST/PUT/PATCH/DELETE` SHALL require admin role.

#### Scenario: Public list jugadores
- **WHEN** an anonymous client calls `GET /jugadores`
- **THEN** the system returns the jugador list with status 200.
