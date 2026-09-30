## Why

La carga de goles en `PartidoManagePage` mezcla la lista completa de jugadores con la cronología global de eventos, lo que genera demasiado desplazamiento en el móvil. Se necesita una presentación compacta que conserve la carga rápida y facilite la corrección por jugador.

## What Changes

- Cada jugador convocado mostrará sus conteos calculados de `G`, `AG` y `P`.
- Solo aparecerán los tipos con valor mayor que cero, con el formato acordado.
- Ejemplos: `G 2`, `AG 1`, `P 1` y `G 2 · P 1`.
- Tocar la fila del jugador abrirá el flujo existente para agregar `GOL`, `AUTOGOL` o `PENAL`.
- Habrá un control separado para quitar, visible cuando el jugador tenga al menos un evento.
- Ese control abrirá el `Sheet` existente en modo de corrección, con solo los eventos del jugador seleccionado.
- La cronología global seguirá disponible, pero colapsada para reducir el desplazamiento.
- Se mantendrá el flujo de dos toques para agregar, sin confirmación previa, con toast de deshacer.
- Los estados de envío, error y reintento manual seguirán visibles.
- `P` continuará significando penal durante el partido y no incluirá penales de definición.
- `AG` continuará representando autogoles del jugador, sin implicar que esos goles pertenecen al marcador de su equipo.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `carga-en-vivo`: la carga compacta muestra conteos por jugador, conserva el flujo rápido de dos toques, ofrece corrección por jugador y colapsa la cronología global.

## Impact

- Frontend: cambios concentrados en `CargaVivo` y sus pruebas.
- API y backend: sin cambios; los conteos se derivan de los eventos ya disponibles.
- Accesibilidad móvil: controles separados con objetivos táctiles adecuados y sin botones anidados.
