## ADDED Requirements

### Requirement: Administrative partido list shows resultado
The administrative list of partidos for a liga SHALL display each partido's calculated local and visiting goal totals. The displayed resultado SHALL use the same event-derived calculation as the public partido list and partido detail.

#### Scenario: Admin reviews liga fixture
- **WHEN** an admin opens the administrative partidos list for a liga containing a scoring match
- **THEN** that match row displays its calculated local and visiting goal totals without requiring the admin to open the match workspace.
