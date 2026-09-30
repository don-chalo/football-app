## MODIFIED Requirements

### Requirement: Two-tap goal entry
Tapping a player SHALL open a bottom sheet with three large options (GOL, AUTOGOL, PENAL); tapping a type SHALL register the event immediately with no confirmation step; minuto is optional and MAY be left empty. Each convocated player row SHALL display that player's calculated totals using `G`, `AG` and `P`, showing only event types with a value greater than zero and using one space between each label and digit (for example, `G 2`, `AG 1`, or `G 2 · P 1`).

#### Scenario: Register gol in two taps
- **WHEN** an admin taps a player then taps GOL
- **THEN** the goal is sent and appears in the event list on the next refresh.

#### Scenario: Player totals show only nonzero types
- **WHEN** a player has one autogol and no goles or in-match penales
- **THEN** that player's row displays `AG 1` and omits `G` and `P`.

### Requirement: Undo and send states
After registering, the system SHALL show an undo toast and a recent-events list with per-event delete; each send SHALL show sending→ok/error states with manual retry on error (no automatic retries). The global recent-events list MAY be collapsed by default, but SHALL remain expandable. The system SHALL also offer player-scoped correction: opening correction for a selected player SHALL list only that player's eventos, each with its own delete control.

#### Scenario: Undo a mis-tap
- **WHEN** an admin taps undo within the toast window
- **THEN** the event is deleted and the marcador updates.

#### Scenario: Correct one player's evento
- **WHEN** an admin opens correction for a player with two eventos and deletes one
- **THEN** only the selected evento is deleted, the player's displayed totals update, and the marcador updates.

#### Scenario: Removal is unavailable without eventos
- **WHEN** a player has no gol, autogol or in-match penal eventos
- **THEN** no active per-player removal control is offered for that player.
