## Purpose

Quitar jugadores de la convocatoria con protección contra goles huérfanos.

## ADDED Requirements

### Requirement: Remove convocado with guard
Each convocatoria row SHALL offer Quitar with inline two-step confirm; removal SHALL be blocked with a message when the player has registered events ("borra primero sus goles").

#### Scenario: Blocked removal
- **WHEN** an admin tries to remove a convocado with goals
- **THEN** the UI blocks with a message and keeps the convocatoria.
