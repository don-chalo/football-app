# ux-movil Specification

## Purpose

Experiencia movil primero: todo usable con una mano en 360px, tactil y con red inestable.

## Requirements

### Requirement: Mobile-first layout and touch targets
All views SHALL be usable at 360px width with tap targets ≥ 44px, bottom-sheet menus for actions, and no horizontal scrolling on core flows. Points tables SHALL show Equipo/PJ/DIF/%/Pts on small screens with a tappable row expansion revealing PG/PE/PP/GF/GC. Player tables SHALL show Jugador/PJ/PG/PE/PP/Goles below `sm` (% added from `sm`), hiding Autogoles/TA/TR/Convocado/Ausencias below `md`, with a tappable row expansion revealing %/Autogoles/TA/TR/Convocado/Ausencias. The site footer SHALL meet the same tap-target and no-horizontal-scroll rules at 360px. Keyboard navigation SHALL show a visible focus ring on interactive elements.

#### Scenario: Load goal on phone
- **WHEN** a planillero loads a goal on a 360px phone
- **THEN** player list, type sheet and undo are reachable without zoom or sideways scroll.

#### Scenario: Table fits without sideways scroll
- **WHEN** a visitor opens a points table on a 360px phone
- **THEN** they see Equipo/PJ/DIF/%/Pts with no horizontal scroll, and tapping a row reveals the remaining columns.

#### Scenario: Keyboard focus is visible
- **WHEN** a user tabs through buttons, links and tabs
- **THEN** the focused element shows a green focus ring.

#### Scenario: Footer fits without sideways scroll
- **WHEN** a visitor opens any page on a 360px phone
- **THEN** the footer shows brand, navigation, Instagram and season year with no horizontal scroll and tap targets ≥ 44px.

#### Scenario: Players table fits without sideways scroll
- **WHEN** a visitor opens a players table on a 360px phone
- **THEN** they see Jugador/PJ/PG/PE/PP/Goles with no horizontal scroll, and tapping a row reveals %/Autogoles/TA/TR/Convocado/Ausencias.

### Requirement: Skeleton loading states
Main views (ligas, fixture, workspace) SHALL show skeleton placeholders shaped like their lists while loading instead of plain "Cargando..." text.

#### Scenario: Skeleton on entry
- **WHEN** a visitor opens a liga fixture with no cached data
- **THEN** they see skeleton rows until the first poll resolves.

### Requirement: Visible request states
Mutations SHALL show sending/ok/error states inline; errors SHALL keep user input and offer manual retry.

#### Scenario: Failed send keeps data
- **WHEN** a goal send fails (network or 422)
- **THEN** the UI shows the error and the selection is preserved for manual retry.
