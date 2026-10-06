# carga-en-vivo Specification

## Purpose

Carga de goles al borde de la cancha desde el celular: 2 taps por gol, con deshacer y refresco rapido.

## Requirements

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

### Requirement: Fast polling while loading
The live-load view SHALL poll every ~5s (fixed) and refresh immediately after its own mutations.

#### Scenario: Own goal appears instantly
- **WHEN** the admin registers a goal
- **THEN** the view refreshes without waiting for the next tick.

### Requirement: Add player per equipo
Each equipo section SHALL end with an "+ Agregar jugador" control opening a sheet that lists available jugadores (catalog excluding already-convocados for this partido) with a name filter input; tapping a jugador SHALL toggle their selection (visually marked with `aria-pressed`) instead of adding immediately. The sheet SHALL show an "Agregar (N)" button with the live selection count (disabled with 0); confirming SHALL add all selected jugadores to that equipo's convocatoria in a single request, show a confirmation toast, close the sheet and refresh once. No equipo picker is offered.

#### Scenario: Add player to one equipo
- **WHEN** an admin taps "+ Agregar jugador" under ALFA, selects only Diego, and confirms
- **THEN** Diego appears in ALFA's convocatoria with a confirmation toast and a single refresh.

#### Scenario: Add several players at once
- **WHEN** an admin taps "+ Agregar jugador" under ALFA, selects Diego and Pedro, and confirms
- **THEN** both appear in ALFA's convocatoria with a confirmation toast and a single refresh.

#### Scenario: Name filter narrows the list
- **WHEN** an admin types "die" in the sheet filter input
- **THEN** only matching available jugadores are shown.

#### Scenario: Empty selection cannot confirm
- **WHEN** an admin opens the sheet without selecting anyone
- **THEN** the "Agregar (0)" button is disabled.

### Requirement: Automatic minute from match clock
While the match clock is running, registering a goal from the player sheet SHALL store the clock-derived minute automatically with no manual input. While paused or in correction (`finalizado`), the manual "Minuto (opcional)" field SHALL apply.

#### Scenario: Auto minute while running
- **WHEN** an admin registers a gol with the clock running at 64'
- **THEN** the evento is stored with minuto 64.

#### Scenario: Manual minute while paused
- **WHEN** an admin registers a gol while paused
- **THEN** the manual minute field decides (empty allowed).
