## 0. Estandares de mantenibilidad

- [x] 0.1 Definir proyecto TypeScript strict con Express + Mongoose (tsconfig, `tsc --noEmit`) + estructura en capas (routes/controllers/services/repositories) + lint + naming y verificar `tsc --noEmit` y `lint` pasan en vacio
- [x] 0.2 Configurar framework de tests unitarios + gate de cobertura en modulos de dominio y verificar `test:unit` + reporte de cobertura OK

## 1. Base y Auth

- [x] 1.1 Scaffold API Express + TypeScript + conexion Mongoose + healthcheck y verificar `GET /health` 200 y `tsc --noEmit` OK
- [x] 1.2 Implementar modelo usuarios + `POST /auth/login` JWT (service + repository) y verificar login 200 / credenciales invalidas 401 + tests unitarios del service con repo fake
- [x] 1.3 Implementar middleware roles (publico GET, admin escribe; usuarios solo admin_usuarios) y verificar 401 anonimo / 403 admin_partidos en POST /usuarios + tests del middleware
- [x] 1.4 Implementar CRUD usuarios (solo admin_usuarios, password hashed, username UNIQUE ci) y verificar crear 201 / duplicado 409 / password no expuesto + tests de validacion y unicidad

## 2. Ligas y Catalogos

- [x] 2.1 Implementar CRUD ligas via service+repository (nombre, formato liga|copa, ida_vuelta) y verificar crear liga y copa 201 + GET publico + tests unitarios de validacion
- [x] 2.2 Implementar CRUD equipos (nombre UNIQUE ci) y verificar crear 201 / duplicado 409 + tests de unicidad case-insensitive
- [x] 2.3 Implementar CRUD jugadores + bulk create y verificar crear 201 / bulk 3 ok / duplicado 409 + tests del bulk (parcial OK + reporte de errores)

## 3. Partidos

- [x] 3.1 Implementar CRUD partidos manuales via service (liga, local!=visita, fecha, estado default programado, fase libre, llave vinculada, penales nullable) y verificar crear 201 / mismo equipo 422 / GET publico con marcador + tests de validacion pura
- [x] 3.2 Implementar maquina de estados pura + `PATCH /partidos/{id}/estado` programado->en_juego->finalizado y verificar avance 200 / retroceso a programado 422 + tests unitarios de todas las transiciones
- [x] 3.3 Implementar penales minimo (penales_local/visita, clasificado) sin afectar stats y verificar tanda no suma a goleadores ni GF/GC + test de exclusion

## 4. Convocatorias y Eventos

- [x] 4.1 Implementar convocatorias via service (jugador+equipo+convocado|ausente default convocado, no doble equipo) y verificar convocar 201 / doble 422 / ausente editable + tests de reglas puras
- [x] 4.2 Implementar eventos con Strategy por tipo gol|autogol|penal (minuto nullable, metadata JSON, solo convocado-presente, en_juego crea / finalizado corrige) y verificar gol en vivo 201 / gol de ausente 422 + tests por tipo incluyendo tipo futuro que no rompe existentes
- [x] 4.3 Implementar reglas puras autogol (GF rival + GC propio + stat autogoles, no goleadores) y penal-en-juego (cuenta marcador+goleador) y verificar con partido de prueba + tests unitarios parametrizados

## 5. Estadisticas

- [x] 5.1 Implementar `GET /estadisticas/equipos` como funciones puras + capa query (PJ/PG/PE/PP/GF/GC/Dif/Pts, solo finalizados, filtros liga_ids + desde/hasta default ano curso max 1 ano, orden Pts/Dif/GF) y verificar tabla + rango >1ano 422 + tests de orden y agregacion
- [x] 5.2 Implementar `GET /estadisticas/jugadores` puro (PJ/PG/PE/PP por equipo jugado, goles, autogoles, convocados, ausentes, %inasistencia, jugados; filtros ligas+fechas+equipo opcional+partido opcional) y verificar caso 2 partidos/2 equipos ganadores => PJ=2 PG=2 + %inasistencia + tests parametrizados
- [x] 5.3 Implementar `GET /estadisticas/enfrentamientos` (PJ, ganA, emp, ganB, GF, lista partidos) y verificar historial entre dos equipos + tests

## 6. Cierre

- [x] 6.1 Verificar matriz completa publico vs admin_partidos vs admin_usuarios en todos los endpoints (GET 200 anonimo, writes 401/403 segun rol) + tests de integracion de permisos
- [x] 6.2 Verificar gate de cobertura en modulos de dominio y `lint` limpio, luego documentar contrato API (endpoints, filtros, errores 401/403/409/422) y verificar ejemplos curl funcionan contra seed barrial
