## Why

No existe un sistema para gestionar ligas barriales de futbol: hoy el fixture, los resultados y las estadisticas se llevan a mano. Se necesita una API REST que centralice N ligas (formato liga o copa), sus partidos, convocatorias y goles, con lectura publica y escritura solo para administradores, para luego construir el sitio web encima.

## What Changes

- API REST nueva con lectura publica (`GET`) y escritura restringida por roles (`POST/PUT/PATCH/DELETE`).
- Gestion de usuarios con roles `admin_partidos` y `admin_usuarios` (superset) + login JWT.
- CRUD de Ligas (=Torneos) con formato `liga` (todos contra todos, solo ida) o `copa` (eliminacion directa, configurable `ida_vuelta` a nivel liga).
- Catalogos globales de Equipos y Jugadores (solo `id + nombre` UNIQUE case-insensitive), con creacion bulk de jugadores.
- CRUD de Partidos 100% manual: `liga, local, visita, fecha, estado, fase libre, llave copa vinculada, penales minimo`. Estado `programado -> en_juego -> finalizado`, sin volver a `programado`; correccion en `finalizado` via edicion de eventos.
- Convocatorias por partido (`jugador + equipo + convocado|ausente`, default `convocado`=presente) y eventos extensibles (`jugador + equipo + tipo gol|autogol|penal` + `minuto` nullable + `metadata` JSON para futuro: asistencias, tarjetas).
- Estadisticas 100% calculadas (nunca almacenadas), solo sobre partidos `finalizados`: tabla equipos, estadisticas por jugador (PJ/PG/PE/PP, goles, autogoles, convocados, ausentes, % inasistencia, jugados), historial entre dos equipos. Filtros por ligas/copas + rango fechas (default ano en curso, max 1 ano); filtro equipo opcional para jugador; Pts siempre (3/1/0) aunque no haya campeon.
- Reglas de negocio: gol solo de convocado-presente; autogol suma GF al rival + GC propio + stat autogoles; penal-en-juego cuenta (marcador + goleador); tanda de penales no cuenta, solo define ganador/clasificado; mismo jugador no puede estar en dos equipos del mismo partido; local != visita.

## Capabilities

### New Capabilities
- `auth-usuarios`: login JWT, roles, CRUD usuarios (solo admin_usuarios), permisos por rol.
- `ligas`: CRUD ligas/torneos con formato y config copa.
- `equipos`: catalogo global equipos (nombre UNIQUE), CRUD.
- `jugadores`: catalogo global jugadores (nombre UNIQUE), CRUD + bulk create.
- `partidos`: CRUD partidos manuales, estados, fase libre, llave copa vinculada, penales minimo, validaciones.
- `eventos`: convocatorias (convocado|ausente) + eventos de partido (gol|autogol|penal) extensibles, reglas de validacion.
- `estadisticas`: tabla equipos, stats jugador, historial enfrentamientos, reglas de calculo y filtros.

### Modified Capabilities
- Ninguna (proyecto nuevo, sin specs existentes).

## Impact

- Proyecto nuevo, sin codigo afectado. La API es el contrato para el futuro sitio web (desacoplado).
- Stack fijado: TypeScript + Express + Mongoose (MongoDB) + JWT. Codigo mantenible con patrones de diseno y tests unitarios (ver design.md).
- Breaking: N/A (creacion inicial).
