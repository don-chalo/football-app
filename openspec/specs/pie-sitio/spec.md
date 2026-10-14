# pie-sitio Specification

## Purpose

Gives every public page a consistent closing band with brand, navigation mirror, the club's Instagram, and the current season year.

## Requirements

### Requirement: Static public footer
Every public route SHALL render a static (end-of-page, non-fixed) footer below the main content with the ACSED WEB brand mark, mirror links to Ligas/Copas and Stats stacked vertically on the left, social links (Instagram `@fcacsed` pointing to `https://www.instagram.com/fcacsed`) stacked vertically on the right, and a baseline line `Temporada {año}` where the year is computed at render time. Footer links SHALL be underlined text without bordered boxes. On pages shorter than the viewport the footer SHALL sit against the bottom edge of the browser with no gap. The footer SHALL NOT include admin links or slogans.

#### Scenario: Visitor reaches page end
- **WHEN** a visitor scrolls to the bottom of any public page
- **THEN** they see the brand, left-aligned Ligas/Copas and Stats links, right-aligned social links, and the current season year.

#### Scenario: Short page has no gap below footer
- **WHEN** a visitor opens a page shorter than the viewport
- **THEN** the footer sits against the bottom edge of the browser with no background gap below it.

#### Scenario: Instagram opens externally
- **WHEN** a visitor activates the Instagram link
- **THEN** `https://www.instagram.com/fcacsed` opens in a new tab with `rel="noreferrer"`.
