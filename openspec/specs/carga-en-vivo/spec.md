# carga-en-vivo Specification

## Purpose

Carga de goles al borde de la cancha desde el celular: 2 taps por gol, con deshacer y refresco rapido.

## Requirements

### Requirement: Squad and absence marking
The live view SHALL list convocados grouped by equipo and allow marking ausente/convocado from the same list.

#### Scenario: Mark absent
- **WHEN** an admin marks a convocado as ausente
- **THEN** that player can no longer receive goals (API 422 is surfaced if attempted).

### Requirement: Two-tap goal entry
Tapping a player SHALL open a bottom sheet with three large options (GOL, AUTOGOL, PENAL); tapping a type SHALL register the event immediately with no confirmation step; minuto is optional and MAY be left empty.

#### Scenario: Register gol in two taps
- **WHEN** an admin taps a player then taps GOL
- **THEN** the goal is sent and appears in the event list on the next refresh.

### Requirement: Undo and send states
After registering, the system SHALL show an undo toast and a recent-events list with per-event delete; each send SHALL show sending→ok/error states with manual retry on error (no automatic retries).

#### Scenario: Undo a mis-tap
- **WHEN** an admin taps undo within the toast window
- **THEN** the event is deleted and the marcador updates.

### Requirement: Fast polling while loading
The live-load view SHALL poll every ~5s (fixed) and refresh immediately after its own mutations.

#### Scenario: Own goal appears instantly
- **WHEN** the admin registers a goal
- **THEN** the view refreshes without waiting for the next tick.
