## Purpose

Crear partidos sin re-elegir la liga cuando se viene de su ficha.

## ADDED Requirements

### Requirement: Preselected locked liga
`GET /admin/partidos/nuevo?ligaId=X` SHALL preselect that liga with the selector disabled; without the param the selector stays editable.

#### Scenario: From liga management
- **WHEN** an admin opens Nuevo partido from a liga
- **THEN** the liga is preselected and locked.
