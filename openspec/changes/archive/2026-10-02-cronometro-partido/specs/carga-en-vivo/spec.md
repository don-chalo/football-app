## ADDED Requirements

### Requirement: Automatic minute from match clock
While the match clock is running, registering a goal from the player sheet SHALL store the clock-derived minute automatically with no manual input. While paused or in correction (`finalizado`), the manual "Minuto (opcional)" field SHALL apply.

#### Scenario: Auto minute while running
- **WHEN** an admin registers a gol with the clock running at 64'
- **THEN** the evento is stored with minuto 64.

#### Scenario: Manual minute while paused
- **WHEN** an admin registers a gol while paused
- **THEN** the manual minute field decides (empty allowed).
