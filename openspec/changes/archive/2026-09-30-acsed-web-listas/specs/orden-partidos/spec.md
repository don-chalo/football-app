## Purpose

Listas de partidos con los más nuevos primero, en todas las vistas que los muestran.

## ADDED Requirements

### Requirement: Orden descendente por fecha
Every match list SHALL be ordered by `fecha` descending (newest first), with no secondary criterion. Within copa fase groups, matches SHALL also be newest-first.

#### Scenario: Liga fixture shows newest first
- **WHEN** a visitor opens Partidos of a liga
- **THEN** the first item is the one with the latest fecha.
