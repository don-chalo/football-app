## Context

`PartidoManagePage.tsx` renders two player lists: `Convocatorias` (card "Convocados", con selects Jugador+Equipo) y `CargaVivo` (card "Cargar goles", solo presentes, solo en `en_juego`/`finalizado`). Ver proposal.md (Why). Sin cambios de API: mismos endpoints vía `services.*`.

## Goals / Non-Goals

- Goals: una sola lista siempre visible; sheet por jugador con goles (según estado) + Ausente/Quitar; agregar por equipo sin select; conservar guardia de quitar y cronología.
- Non-Goals: cronómetro y minuto automático (change `cronometro-partido`); buscador en sheet de disponibles (mejora futura); cambios de API.

## Decisions

- **Extender `CargaVivo`, no crear componente nuevo.** Ya agrupa por equipo, tiene sheet agregar/quitar, conteos y cronología. Alternativa (nuevo `ConvocatoriaUnificada.tsx` que componga piezas) descartada: duplicaría la lógica de sheet/conteos.
- **La lista muestra todos los convocados, no solo presentes.** `presentes` se reemplaza por la lista completa; ausentes atenuados con "(ausente)". El botón de fila abre el sheet también para ausentes (label dinámico Presente/Ausente).
- **Sheet con modos extendidos.** `Hoja` suma `{ modo: "agregar-jugador"; equipoId }` (lista disponibles = catálogo menos ya convocados, tap agrega y cierra en silencio). El modo "agregar" (gol) oculta tipos en `programado` y suma fila horizontal Ausente/Quitar; Quitar usa confirmación inline en 2 taps reutilizando la guardia de eventos existente. Requiere prop nueva `estadoPartido`.
- **Fetch del catálogo se muda a `CargaVivo`.** `Convocatorias` hacía `services.jugadores.listar()` con polling 60s; se mueve tal cual. Props nuevas: `estadoPartido`, `localId`, `visitaId` (para secciones + agregar). `Convocatorias` (incluido su export) se elimina; verificar que nada más lo importa.
- **Ausente con goles permitido.** Sin validación extra al marcar ausente; la corrección es manual (decisión de diseño validada con el operador).
- **Cronología sin cambios.** Sigue colapsable con el mismo contenido (el change `cronometro-partido` agregará inicio/fin).

## Risks

- `CargaVivo` crece (~350 líneas): mitigado extrayendo `HojaAgregar` si el archivo se vuelve inmanejable durante la implementación.
- Tests `PartidoManagePage.test.tsx` que buscan "Quitar" deben reescribirse al moverse el flujo al sheet.
