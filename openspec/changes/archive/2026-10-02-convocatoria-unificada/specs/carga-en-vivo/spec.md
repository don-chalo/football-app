## MODIFIED Requirements

### Requirement: Squad and absence marking
The unified player list SHALL show all convocados grouped by equipo in every partido estado, including ausentes shown subdued and marked "(ausente)", and allow marking ausente/convocado from the player's sheet. Marking ausente SHALL NOT remove or block that player's existing eventos; an ausente MAY keep registered goals for manual correction.

#### Scenario: Mark absent
- **WHEN** an admin marks a convocado as ausente from the player's sheet
- **THEN** the player stays visible in the list, subdued and marked ausente, and keeps any registered eventos.

#### Scenario: Ausente returns
- **WHEN** an admin marks an ausente player back to convocado
- **THEN** the player appears normal again and can receive goals.

### Requirement: Two-tap goal entry
Tapping a player SHALL open a bottom sheet with three large options (GOL, AUTOGOL, PENAL) when the partido is `en_juego` or `finalizado`; tapping a type SHALL register the event immediately with no confirmation step; minuto is optional and MAY be left empty. In `programado` the sheet SHALL NOT offer goal options. The sheet SHALL also offer an Ausente toggle and Quitar side by side. Each convocated player row SHALL display that player's calculated totals using `G`, `AG` and `P`, showing only event types with a value greater than zero and using one space between each label and digit (for example, `G 2`, `AG 1`, or `G 2 · P 1`).

#### Scenario: Register gol in two taps
- **WHEN** an admin taps a player then taps GOL
- **THEN** the goal is sent and appears in the event list on the next refresh.

#### Scenario: Player totals show only nonzero types
- **WHEN** a player has one autogol and no goles or in-match penales
- **THEN** that player's row displays `AG 1` and omits `G` and `P`.

#### Scenario: No goals offered before start
- **WHEN** an admin taps a player while the partido is `programado`
- **THEN** the sheet offers only Ausente and Quitar, no goal types.

## ADDED Requirements

### Requirement: Add player per equipo
Each equipo section SHALL end with an "+ Agregar jugador" control opening a sheet that lists available jugadores (catalog excluding already-convocados for this partido); tapping a jugador SHALL add them to that equipo's convocatoria silently and close the sheet. No equipo picker is offered.

#### Scenario: Add player to one equipo
- **WHEN** an admin taps "+ Agregar jugador" under ALFA and taps Diego
- **THEN** Diego appears in ALFA's convocatoria without any toast or confirm.
