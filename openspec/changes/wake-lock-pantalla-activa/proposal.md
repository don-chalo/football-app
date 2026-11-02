## Why

Cuando un planillero carga goles o tarjetas desde el móvil en un partido en juego, la pantalla se puede apagar y bloquear, interrumpiendo el flujo. Se necesita mantener la pantalla activa solo en la pantalla de gestión mientras el partido esté en juego.

## What Changes

- Nuevo hook `useWakeLock(enabled)` que adquiere/libera `navigator.wakeLock.request('screen')` con degradación graceful si el navegador no lo soporta (iOS, Firefox, HTTP no seguro).
- `PartidoManagePage` activa el wake lock cuando `estado === "en_juego"` y no está pausado; lo libera al finalizar, suspender o salir.
- Espec `gestion-partido`: nuevo requisito de pantalla activa en workspace mientras `en_juego`.
- Espec `ux-movil`: nuevo requisito de pantalla activa en móvil durante partido en vivo.
- No se toca `PartidoPage` (vista pública). No hay cambios de API ni de base de datos.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `gestion-partido`: pantalla activa en workspace mientras el partido está en juego.
- `ux-movil`: pantalla no se bloquea durante partido en vivo en la pantalla de gestión.

## Impact

- `acsed-web/src/hooks/useWakeLock.ts` (nuevo)
- `acsed-web/src/pages/PartidoManagePage.tsx` (llamada al hook)
- `acsed-web/src/hooks/useWakeLock.test.ts` (tests)
- `openspec/specs/gestion-partido/spec.md` (delta)
- `openspec/specs/ux-movil/spec.md` (delta)
