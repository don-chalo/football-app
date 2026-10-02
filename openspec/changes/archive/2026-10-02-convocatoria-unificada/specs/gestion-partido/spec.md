## ADDED Requirements

### Requirement: Single convocatoria list in match workspace
The admin match workspace SHALL show exactly one convocatoria list ("Convocatoria y goles"), visible in every estado (`programado`, `en_juego`, `finalizado`); there SHALL be no separate "Convocados" card.

#### Scenario: Workspace has one list
- **WHEN** an admin opens a partido workspace in any estado
- **THEN** they see a single player list grouped by equipo and no separate Convocados section.
