## Purpose

Auditoria Nivel 2 visible: quien hizo que y cuando, en ficha y gestion.

## ADDED Requirements

### Requirement: Actor shown on reads
Match views SHALL show who loaded each goal and when (`createdBy` + timestamp); liga/partido details SHALL show who created them; records without actor SHALL render "sin registro" without breaking.

#### Scenario: Loader attribution
- **WHEN** a visitor opens a match with events
- **THEN** each event shows loader name and time (or "sin registro" for legacy).
