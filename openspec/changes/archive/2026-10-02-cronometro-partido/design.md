## Context

El backend (`Partido`: `estado/fecha/fase/penales`, sin tiempos) no guarda cuándo inició un partido; el frontend no tiene reloj. Ver proposal.md (Why). Este change se implementa sobre el layout del change `convocatoria-unificada`.

## Goals / Non-Goals

- Goals: persistir tiempos con pausa, card visible solo en `en_juego`, minuto auto/manual según reloj, gating por fecha en web+API, inicio/fin en ambas cronologías, fecha sin segundos.
- Non-Goals: periodos 1T/2T o entretiempo formal (la Pausa lo cubre); segundos en el minuto del gol; editor manual de `inicioEn`.

## Decisions

- **4 campos en `Partido`, sin colección nueva.** `inicioEn/pausaDesde/finEn: Date|null`, `pausaAcumSeg: number default 0`. Suficiente para derivar todo; evita historial de pausas (innecesario).
- **Reutilizar `cambiarEstado` para inicio/fin.** A `en_juego`: `inicioEn ??= now` (+ 400 si `now < fecha`); a `finalizado`: `finEn = now`. Un solo endpoint nuevo: `POST /partidos/:id/pausa {pausada}` (rechaza si no está `en_juego`). Alternativa (endpoints iniciar/pausar/reanudar/finalizar separados) descartada: más superficie para el mismo modelo.
- **Minuto derivado en frontend, no almacenado por tick.** `minuto = max(1, floor(transcurrido/60s)+1)` en hook `useCronometro(p)` compartido por la card y `CargaVivo`; el minuto final de "Fin · N'" usa la misma fórmula con `finEn`. Sin drift: tick local 1s + re-ancla con el polling existente (5s gestión / 12s pública).
- **Gol corriendo: sin campo de texto.** Si el reloj corre, el sheet muestra "Minuto: N' (auto)" y envía ese valor; en pausa/finalizado se conserva el campo opcional actual. Regla sin excepciones para no bifurcar la UX.
- **Delta `carga-en-vivo` como ADDED, no MODIFIED.** `convocatoria-unificada` ya modifica "Two-tap goal entry"; agregar requisito nuevo evita solape en el merge de specs (aplicar unificada primero).
- **Fecha corta con helper compartido** `formatoFechaCorta` (`DD/MM/YYYY HH:MM`); `PartidoCard` (solo fecha) y `ActorLine` (auditoría) fuera de alcance.

## Risks

- Reloj del dispositivo vs servidor: el gating web usa hora local pero el backend impone la real; discrepancias solo afectan el disabled del botón, nunca la regla.
- Partidos viejos sin `finEn`: cronología muestra "Fin" sin hora (defensivo, sin migración de datos).
