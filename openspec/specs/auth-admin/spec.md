# auth-admin Specification

## Purpose

Acceso de administradores con roles del API y home con sus ligas asignadas.

## Requirements

### Requirement: Login and session
The system SHALL provide login with username/password, store the JWT for subsequent calls, show 401 errors clearly, and allow logout.

#### Scenario: Successful login
- **WHEN** an admin logs in with valid credentials
- **THEN** they land on their home and the token is sent on admin calls.

### Requirement: Role guards and assigned home
Admin routes SHALL require a valid session; the home SHALL list `misLigas` (all ligas for admin_usuarios); an admin_partidos with zero ligas SHALL see an empty state; actions beyond the role SHALL surface the API 403 message.

#### Scenario: Empty assignments
- **WHEN** an admin_partidos with no ligas logs in
- **THEN** they see an empty state instead of management tools.
