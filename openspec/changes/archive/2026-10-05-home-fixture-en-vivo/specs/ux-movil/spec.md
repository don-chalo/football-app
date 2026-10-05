## MODIFIED Requirements

### Requirement: Mobile-first layout and touch targets
All views SHALL be usable at 360px width with tap targets ≥ 44px, bottom-sheet menus for actions, and no horizontal scrolling on core flows. Points tables SHALL show Equipo/PJ/DIF/Pts on small screens with a tappable row expansion revealing PG/PE/PP/GF/GC.

#### Scenario: Load goal on phone
- **WHEN** a planillero loads a goal on a 360px phone
- **THEN** player list, type sheet and undo are reachable without zoom or sideways scroll.

#### Scenario: Table fits without sideways scroll
- **WHEN** a visitor opens a points table on a 360px phone
- **THEN** they see Equipo/PJ/DIF/Pts with no horizontal scroll, and tapping a row reveals the remaining columns.
