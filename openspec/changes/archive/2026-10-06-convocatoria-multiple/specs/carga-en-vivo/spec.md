## MODIFIED Requirements

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
