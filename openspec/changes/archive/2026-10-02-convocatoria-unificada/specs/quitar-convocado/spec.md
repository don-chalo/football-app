## MODIFIED Requirements

### Requirement: Remove convocado with guard
The player's sheet SHALL offer Quitar with inline two-step confirm (Quitar → Confirmar/No); removal SHALL be blocked with a message when the player has registered events ("borra primero sus goles").

#### Scenario: Blocked removal
- **WHEN** an admin tries to remove a convocado with goals
- **THEN** the UI blocks with a message and keeps the convocatoria.

#### Scenario: Confirmed removal
- **WHEN** an admin confirms removal of a convocado without events
- **THEN** the convocatoria is removed and the list refreshes.
