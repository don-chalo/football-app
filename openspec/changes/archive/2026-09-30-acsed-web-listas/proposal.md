## Why

La web muestra partidos en orden ascendente (los viejos primero), las tablas no se pueden ordenar, crear un partido obliga a re-elegir la liga, y no se puede quitar un convocado sin marcarlo ausente. Cuatro fricciones chicas, todas front, que mejoran el uso diario del planillero.

## What Changes

- Listas de partidos ordenadas por `fecha` descendente (más nuevos primero), sin criterio secundario.
- Tablas de equipos y jugadores ordenables por columna (incluye nombre): ciclo default API → ASC → DESC → default.
- Form Nuevo partido con liga preseleccionada vía `?ligaId=` y selector bloqueado; sin param, editable como hoy.
- Quitar jugador de convocatoria con confirmación inline en dos pasos y guardia que bloquea si tiene eventos registrados.

## Capabilities

### New Capabilities
- `orden-partidos`: descendente por fecha en listas.
- `orden-columnas`: hook compartido + header clicable, ciclo con retorno a default.
- `liga-preseleccionada`: query param + selector bloqueado.
- `quitar-convocado`: borrado con guardia y confirm inline.

### Modified Capabilities
- Ninguna (comportamientos nuevos, no cambios a requisitos existentes).

## Impact

- Solo `acsed-web/src`. Sin cambios de API ni de specs principales.
