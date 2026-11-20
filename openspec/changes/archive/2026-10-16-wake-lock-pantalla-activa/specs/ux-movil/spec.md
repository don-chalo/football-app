## MODIFIED Requirements

### Requirement: Pantalla no se bloquea durante partido en vivo en móvil
En la pantalla de gestión de un partido `en_juego`, el móvil SHALL mantener la pantalla activa mientras el planillero carga eventos. El lock SHALL adquirirse al entrar en `en_juego` y re-adquirirse si el partido vuelve a `en_juego` tras una pausa; SHALL liberarse al finalizar, suspender o salir de la pantalla. La experiencia móvil SHALL cumplir las reglas de tap target ≥ 44px y no horizontal scrolling mientras el lock está activo.

#### Scenario: Pantalla activa en móvil durante partido en vivo (ADDED)
- **WHEN** un planillero abre un partido en juego en un móvil
- **THEN** la pantalla permanece activa mientras carga goles o tarjetas
