## Why

El home es una lista plana de ligas y el fixture mezcla todos los estados: un visitante no ve qué se está jugando HOY sin abrir cada liga. Una sección "En juego ahora" + próximos, filtro por estado y fixture legible en 360px convierten la visita en hallazgo inmediato.

## What Changes

- Home (`LigasPage`): sección "En juego ahora" (partidos `en_juego` de todas las ligas, con link al detalle) + "Próximos" (siguientes `programado` ordenados por fecha); debajo, la lista de ligas actual.
- Fixture (`LigaDetailPage` pestaña Partidos): filtro por estado (Todos | En juego | Programados | Finalizados | Suspendidos) con chips; respeta el orden por fecha actual.
- `PartidoCard` apilado: equipos uno debajo del otro con marcador grande a la derecha; segunda línea con fase, fecha corta y badge de estado. Mismo contenido, sin grid anidado.
- Header con logo: `SoccerBall` junto a "ACSED WEB".
- Empty states con acción: "Sin partidos." ofrece "Crear partido" cuando el usuario es admin.
- Tablas responsive: en móvil solo Equipo/PJ/DIF/Pts + fila expandible al tap con PG/PE/PP/GF/GC (aplica a `TablaTab` y stats globales de equipos).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `publico-ligas`: home con secciones En juego/Próximos sobre el listado.
- `publico-partidos`: fixture con filtro por estado; card apilada.
- `ux-movil`: tablas colapsadas en móvil con expandible.

## Impact

- Solo `acsed-web`: `LigasPage`, `LigaDetailPage`, `PartidoCard`, `App` (logo), empties, tablas de posiciones, tests.
- Requiere partidos de todas las ligas para "En juego ahora" (agregación en frontend vía servicios existentes).
