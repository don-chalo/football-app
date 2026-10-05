## Context

Home (`LigasPage`) y fixture (`LigaDetailPage/PartidosTab`) son listas planas; `PartidoCard` usa grid anidado que se aprieta en 360px; las tablas tienen 8 columnas. Ver proposal.md (Why). Solo `acsed-web`, sin cambios de API (agregación de "En juego ahora" vía `services.partidos.porLiga` por liga o endpoint existente de listado).

## Goals / Non-Goals

- Goals: hallazgo inmediato de lo en vivo, fixture filtrable, card y tablas legibles en 360px, marca visible.
- Non-Goals: modo oscuro, offline, cambios de API, buscador (no pedido).

## Decisions

- **"En juego ahora" agregado en frontend.** Un `porLiga` por liga + merge ordenado por fecha; con pocas ligas el costo es despreciable frente a agregar endpoint. Si escala, mover a backend.
- **Filtro como chips locales.** Estado en `useState` del tab, sin query params (el fixture no se comparte por URL hoy); evita sincronizar router.
- **Card apilada, mismo contenido.** Equipos en columna, marcador grande, segunda línea fase/fecha/badge. Sin cambiar datos ni navegación.
- **Tabla expandible, no segunda vista.** La fila tap expande PG/PE/PP/GF/GC inline (Collapsible ya usado en el proyecto); un componente `FilaExpandible` compartido entre `TablaTab` y stats globales.
- **Logo + empties.** `SoccerBall` existente junto a la marca; empties con acción solo cuando hay rol que la permite (admin).

## Risks

- "En juego ahora" con N ligas = N requests en paralelo al montar home; aceptable (<10 ligas barriales), con `Promise.allSettled` para que una liga caída no rompa la sección.
- Cambiar `PartidoCard` afecta tests que asertan clases (`flex align-middle`); actualizarlos.
