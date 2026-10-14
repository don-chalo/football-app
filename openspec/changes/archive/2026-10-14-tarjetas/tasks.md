## 1. API: tipos y marcador

- [x] 1.1 `domain/types.ts` + `http/schemas.ts` + `models/evento.model.ts`: agregar `amarilla`/`roja`
- [x] 1.2 `domain/marcador.ts`: ramas explícitas sin suma + `golesFavorContra` ignora tarjetas; tests (tarjeta no mueve marcador/GF/GC)
- [x] 1.3 `domain/jugadores.ts` + stats: solo `autogol` cuenta autogol; nuevos `amarillas`/`rojas`; tests
- [x] 1.4 Validación 422 de tarjetas (ausente/suspendido/programado) con tests http

## 2. Web: sheet y cronologías

- [x] 2.1 `CargaVivo`: sheet en dos filas (goles / tarjetas con chips), toast por categoría, totales `TA`/`TR`, quitar en texto
- [x] 2.2 Íconos `TarjetaAmarillaIcon`/`TarjetaRojaIcon` + fix `SoccerBall` className; helper de fila de cronología compartido
- [x] 2.3 Cronología workspace y `PartidoPage`: pelota ajustable para goles, ícono de tarjeta con aria-label
- [x] 2.4 Tablas de jugadores (`LigaDetailPage.JugadoresTab` + `EstadisticasPage`): columnas TA/TR
- [x] 2.5 Tests: registro de tarjeta, cronología con íconos, columnas TA/TR, quitar en texto

## 3. Gates

- [x] 3.1 API: `tsc`/`lint`/`vitest` del repo football-api
- [x] 3.2 Web: `npx tsc --noEmit` + `npm run lint` + `npx vitest run` + `npm run build`
