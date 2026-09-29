# orden-columnas Specification

## Purpose

Tablas ordenables por columna con retorno al orden default del API.

## Requirements

### Requirement: Sortable columns with default cycle
All team and player tables SHALL have clickable headers (numeric columns and nombre); clicks SHALL cycle default → ASC → DESC → default; sorting SHALL survive polling refreshes.

#### Scenario: Third click restores default
- **WHEN** a visitor clicks the Pts header three times
- **THEN** the order returns to the API default (Pts desc).
