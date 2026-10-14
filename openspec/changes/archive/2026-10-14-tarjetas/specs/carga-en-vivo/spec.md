## MODIFIED Requirements

### Requirement: Two-tap goal entry
Tapping a player SHALL open a bottom sheet with goal options when the partido is `en_juego` or `finalizado`: first row GOL, AUTOGOL, PENAL (equal width), second row T. AMARILLA, T. ROJA with color chips; tapping a type SHALL register the event immediately with no confirmation step; minuto is optional and MAY be left empty. In `programado` the sheet SHALL NOT offer goal or card options. The sheet SHALL also offer an Ausente toggle and Quitar side by side. Each convocated player row SHALL display that player's calculated totals using `G`, `AG`, `P`, `TA` and `TR`, showing only event types with a value greater than zero and using one space between each label and digit (for example, `G 2`, `AG 1`, or `G 2 · P 1`). After registering, the toast SHALL say `Tarjeta registrada` for cards and `Gol registrado` for goals.

#### Scenario: Register gol in two taps
- **WHEN** an admin taps a player then taps GOL
- **THEN** the goal is sent and appears in the event list on the next refresh.

#### Scenario: Register card in two taps
- **WHEN** an admin taps a player then taps T. AMARILLA
- **THEN** the card is sent, appears in the event list on the next refresh, and the toast says `Tarjeta registrada`.

#### Scenario: Player totals show only nonzero types
- **WHEN** a player has one autogol and no goles or in-match penales
- **THEN** that player's row displays `AG 1` and omits `G` and `P`.

#### Scenario: No goals offered before start
- **WHEN** an admin taps a player while the partido is `programado`
- **THEN** the sheet offers only Ausente and Quitar, no goal or card types.

### Requirement: Undo and send states
After registering, the system SHALL show an undo toast and a recent-events list with per-event delete; each send SHALL show sending→ok/error states with manual retry on error (no automatic retries). The global recent-events list MAY be collapsed by default, but SHALL remain expandable. The system SHALL also offer player-scoped correction: opening correction for a selected player SHALL list only that player's eventos as text rows (type and minute, no icons), each with its own delete control. The workspace cronología SHALL show an adjustable-size ball icon for gol/penal/autogol and a yellow/red card icon with accessible label for cards.

#### Scenario: Undo a mis-tap
- **WHEN** an admin taps undo within the toast window
- **THEN** the event is deleted and the marcador updates.

#### Scenario: Correct one player's evento
- **WHEN** an admin opens correction for a player with two eventos and deletes one
- **THEN** only the selected evento is deleted, the player's displayed totals update, and the marcador updates.

#### Scenario: Removal is unavailable without eventos
- **WHEN** a player has no gol, autogol, in-match penal, amarilla or roja eventos
- **THEN** no active per-player removal control is offered for that player.

#### Scenario: Cronología shows cards with icons
- **WHEN** a player has a gol and an amarilla in the workspace cronología
- **THEN** the gol row shows the ball icon and the card row shows the yellow card icon, each with minute when present.
