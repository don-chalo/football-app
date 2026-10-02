# cronometro Specification

## Purpose

Cronometro de partido anclado en el servidor con pausa: muestra el tiempo en vivo, sobrevive refreshes y registra el minuto de cada gol automaticamente.

## Requirements

### Requirement: Server-anchored match clock with pause
The API SHALL persist `inicioEn`, `pausaDesde`, `pausaAcumSeg` and `finEn` per partido (all null/0 on creation) and expose them in the partido detalle. Transition to `en_juego` SHALL set `inicioEn` only if null; transition to `finalizado` SHALL set `finEn`. `POST /partidos/:id/pausa {pausada}` SHALL pause/resume only in `en_juego` (pausing sets `pausaDesde`, resuming accumulates into `pausaAcumSeg`). Paused time SHALL NOT count toward the match minute. The web timer SHALL derive the minute from server fields (`(finEn ?? now) - inicioEn - pausaAcumSeg - active pause`), ticking locally each second and re-anchoring on poll.

#### Scenario: Refresh keeps the minute
- **WHEN** the page reloads at minute 63 of a running match
- **THEN** the timer resumes at 63 from server fields.

#### Scenario: Pause freezes the clock
- **WHEN** the match is paused for 10 real minutes and resumed
- **THEN** those 10 minutes do not advance the match minute.

#### Scenario: Double start does not reset
- **WHEN** "Poner en juego" is triggered on an already-started match
- **THEN** `inicioEn` keeps its original value.

### Requirement: Start gated by scheduled datetime
Starting a match SHALL require `now >= fecha` (date+time). The web "Poner en juego" button SHALL be disabled with a "Disponible desde ..." notice before that; the API SHALL reject an early start with 400.

#### Scenario: Early start blocked twice
- **WHEN** an admin opens a future match
- **THEN** the button is disabled with the availability notice, and a direct API start call fails with 400.

### Requirement: Timer display card
The match workspace SHALL show a "Cronómetro" card above the unified list only in `en_juego`: running shows MM:SS with a pulsing EN JUEGO badge and Pausar; paused shows the frozen time with a PAUSADO badge and Reanudar. The card SHALL be hidden in `programado` and `finalizado`.

#### Scenario: Pause and resume from the card
- **WHEN** an admin taps Pausar then Reanudar
- **THEN** the displayed time freezes and resumes, and the badge flips accordingly.

### Requirement: Automatic event minute
While the clock is running, the goal sheet SHALL show "Minuto: N' (auto)" with no text field and send that minute on register. While paused or in `finalizado`, the sheet SHALL keep the manual "Minuto (opcional)" field.

#### Scenario: Auto minute on the run
- **WHEN** an admin registers a gol at clock 64'
- **THEN** the evento is stored with minuto 64 without typing.

### Requirement: Inicio and fin in chronologies
Both chronologies (publica and gestion) SHALL show an "Inicio" hito (with HH:MM from `inicioEn` when present, without time when null) and a "Fin" hito (from `finEn` plus the derived final minute as "Fin HH:MM · N'"; "Fin" without time when `finEn` is null, e.g. legacy matches). The gestion chronology lists newest first (Fin, eventos, Inicio); the publica chronology lists oldest first (Inicio, eventos, Fin).

#### Scenario: Full timeline
- **WHEN** a visitor opens a finished match started 16:05 and ended 17:52 at minute 93
- **THEN** the publica chronology opens with "Inicio 16:05" and closes with "Fin 17:52 · 93'", while the gestion chronology shows "Fin 17:52 · 93'" first and "Inicio 16:05" last.

#### Scenario: Hitos without timestamps
- **WHEN** a finished match has no `inicioEn` or no `finEn` (legacy data)
- **THEN** the chronologies show "Inicio" and/or "Fin" without time rather than omitting the hito.

### Requirement: Match date without seconds
"Fecha de juego" SHALL display as `DD/MM/YYYY HH:MM` (no seconds) in `PartidoPage` and `PartidoManagePage` via a shared formatter.

#### Scenario: Short date
- **WHEN** an admin opens a partido scheduled 16:05:32
- **THEN** they see "02/10/2026 16:05".
