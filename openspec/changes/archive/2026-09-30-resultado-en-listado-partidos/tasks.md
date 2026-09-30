## 1. Contratos y pruebas del listado en el backend

- [x] 1.1 Agregar pruebas del listado para goles, autogoles y penales en juego, y verificar que `npm test -- --run` cubre los nuevos casos.
- [x] 1.2 Agregar pruebas para partidos sin eventos y para eventos editados o eliminados, y verificar que los resultados recalculados son correctos mediante las pruebas del servicio.
- [x] 1.3 Verificar que los penales de definición no alteran el marcador del listado mediante una prueba explícita.

## 2. Implementación del marcador en `GET /partidos`

- [x] 2.1 Recuperar los partidos filtrados y sus eventos en una sola consulta agrupada por partido, reutilizando la lógica existente del detalle, y verificar con las pruebas del servicio.
- [x] 2.2 Incluir `marcador.local` y `marcador.visita` como enteros no negativos en cada elemento del listado, sin eliminar ni renombrar campos existentes, y verificar con una prueba de respuesta HTTP.
- [x] 2.3 Ejecutar `npm run typecheck`, `npm run lint` y `npm test -- --run` en `football-api`, y verificar que los tres comandos pasan.

## 3. Presentación del resultado en el frontend

- [x] 3.1 Extender el modelo de fila de partidos del frontend con el marcador del listado y mostrarlo en las listas pública y administrativa, y verificar con pruebas de componentes.
- [x] 3.2 Verificar que las vistas de lista no realizan una solicitud de detalle por partido mediante una prueba que inspeccione las URLs solicitadas.
- [x] 3.3 Verificar la legibilidad del resultado en 360px sin desplazamiento horizontal en los flujos principales mediante revisión manual o prueba correspondiente.

## 4. Verificación integral

- [x] 4.1 Ejecutar `npm run typecheck`, `npm run lint`, `npm test -- --run` y `npm run build` en `acsed-web`, y verificar que todos pasan.
- [x] 4.2 Ejecutar `openspec validate --change resultado-en-listado-partidos` y verificar que el change no reporta errores.
