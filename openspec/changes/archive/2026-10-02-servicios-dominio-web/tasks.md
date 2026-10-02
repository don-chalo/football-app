## 1. Base de servicios con dependencias inyectadas

- [x] 1.1 Crear la interfaz mínima de transporte, fábricas para partidos, eventos y convocatorias, y el composition root, y verificar con pruebas unitarias que usan un transporte falso para URLs, métodos y cuerpos.
- [x] 1.2 Migrar las llamadas de partidos, eventos y convocatorias hacia los servicios construidos, sin cambiar comportamiento, y verificar con las pruebas existentes y nuevas de servicios.

## 2. Migración gradual y verificación

- [x] 2.1 Crear servicios para ligas, equipos, jugadores, estadísticas, usuarios y asignaciones, migrar sus llamadas y verificar que no queden usos directos del transporte fuera de la capa de servicios mediante búsqueda de código y pruebas.
- [x] 2.2 Ejecutar `npm run typecheck`, `npm run lint`, `npm test -- --run` y `npm run build` en `acsed-web`, y verificar que todos pasan.
