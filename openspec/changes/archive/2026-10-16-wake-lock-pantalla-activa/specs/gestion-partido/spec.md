## MODIFIED Requirements

### Requirement: Pantalla activa durante partido en juego
El workspace de un partido `en_juego` SHALL solicitar un wake lock de pantalla para evitar que el móvil se bloquee mientras el planillero carga goles o tarjetas. El lock SHALL adquirirse al entrar en `en_juego`, liberarse al cambiar a `programado`, `finalizado` o `suspendido`, y re-adquirirse si el partido vuelve a `en_juego` tras estar pausado. El lock SHALL liberarse al salir de la pantalla o al ocultar la pestaña. La página SHALL no fallar si el navegador no soporta `navigator.wakeLock` (iOS, Firefox, contexto inseguro): el comportamiento degradado es simplemente no mantener la pantalla activa.

#### Scenario: Pantalla se mantiene en juego (ADDED)
- **WHEN** un admin pone un partido en juego en la pantalla de gestión
- **THEN** se solicita un wake lock de pantalla y la pantalla permanece activa

#### Scenario: Pantalla se libera al finalizar (ADDED)
- **WHEN** un admin finaliza un partido en juego
- **THEN** el wake lock se libera

#### Scenario: Pantalla se libera al suspender (ADDED)
- **WHEN** un admin suspende un partido en juego
- **THEN** el wake lock se libera

#### Scenario: Sin wake lock en navegador sin soporte (ADDED)
- **WHEN** un admin abre un partido en juego en un navegador que no soporta `navigator.wakeLock`
- **THEN** la página renderiza sin error y no mantiene la pantalla activa
