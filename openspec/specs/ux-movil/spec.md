# ux-movil Specification

## Purpose

Experiencia movil primero: todo usable con una mano en 360px, tactil y con red inestable.

## Requirements

### Requirement: Mobile-first layout and touch targets
All views SHALL be usable at 360px width with tap targets ≥ 44px, bottom-sheet menus for actions, and no horizontal scrolling on core flows.

#### Scenario: Load goal on phone
- **WHEN** a planillero loads a goal on a 360px phone
- **THEN** player list, type sheet and undo are reachable without zoom or sideways scroll.

### Requirement: Visible request states
Mutations SHALL show sending/ok/error states inline; errors SHALL keep user input and offer manual retry.

#### Scenario: Failed send keeps data
- **WHEN** a goal send fails (network or 422)
- **THEN** the UI shows the error and the selection is preserved for manual retry.
