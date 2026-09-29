## Purpose

Authentication and user management for the football API, separating public read access from restricted admin write access with two roles.

## ADDED Requirements

### Requirement: Public read without authentication
All `GET` endpoints for ligas, partidos, equipos, jugadores and estadisticas SHALL be accessible without authentication.

#### Scenario: Anonymous user lists ligas
- **WHEN** an unauthenticated client calls `GET /ligas`
- **THEN** the system returns the liga list with status 200.

### Requirement: Login with JWT
The system SHALL provide `POST /auth/login` accepting username and password and returning a signed token on valid credentials, and 401 on invalid credentials.

#### Scenario: Successful login
- **WHEN** a client posts valid credentials to `POST /auth/login`
- **THEN** the system returns 200 with a token containing the user id and role.

#### Scenario: Failed login
- **WHEN** a client posts invalid credentials to `POST /auth/login`
- **THEN** the system returns 401 without a token.

### Requirement: Role-based write access
All `POST`, `PUT`, `PATCH` and `DELETE` endpoints SHALL require a valid token; endpoints managing ligas, partidos, equipos, jugadores, convocatorias and eventos SHALL accept roles `admin_partidos` and `admin_usuarios`; endpoints managing usuarios SHALL accept only `admin_usuarios`.

#### Scenario: Admin partidos cannot manage users
- **WHEN** a token with role `admin_partidos` calls `POST /usuarios`
- **THEN** the system returns 403.

#### Scenario: Admin usuarios has full access
- **WHEN** a token with role `admin_usuarios` calls `POST /ligas` or `POST /partidos/{id}/goles`
- **THEN** the system authorizes the request (subject to validation).

#### Scenario: Anonymous write is rejected
- **WHEN** an unauthenticated client calls `POST /ligas`
- **THEN** the system returns 401.

### Requirement: User administration
The system SHALL support CRUD of usuarios (`username`, `password` hashed, `role`) restricted to `admin_usuarios`, with `username` UNIQUE case-insensitive.

#### Scenario: Create admin partidos
- **WHEN** an `admin_usuarios` posts a new user with role `admin_partidos` and a unique username
- **THEN** the system creates the user with status 201 and never exposes the password hash.

#### Scenario: Duplicate username rejected
- **WHEN** an `admin_usuarios` creates a user with an existing username (case-insensitive match)
- **THEN** the system returns 409.
