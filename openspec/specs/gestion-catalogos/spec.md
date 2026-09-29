# gestion-catalogos Specification

## Purpose

ABM de ligas, equipos y jugadores para administradores, incluyendo alta masiva de jugadores.

## Requirements

### Requirement: CRUD ligas/equipos/jugadores
The system SHALL provide create/edit/delete forms for ligas (nombre, formato, idaVuelta for copa), equipos and jugadores (nombre only), honoring 409 duplicate and 403 scope errors from the API.

#### Scenario: Duplicate name
- **WHEN** creating an equipo with an existing name
- **THEN** the form shows the duplicate error without losing input.

### Requirement: Bulk player creation
The system SHALL allow pasting/adding several player names at once, showing per-item results (created vs errors) as returned by the API.

#### Scenario: Bulk with one duplicate
- **WHEN** bulk-creating three names where one exists
- **THEN** two are created and the duplicate is reported inline.

### Requirement: User management (admin_usuarios only)
The system SHALL expose user CRUD plus liga assignment UI only to admin_usuarios; admin_partidos SHALL NOT see these screens.

#### Scenario: Planillero cannot see users
- **WHEN** an admin_partidos navigates the admin menu
- **THEN** no users/assignments options are present.
