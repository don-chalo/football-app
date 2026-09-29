## 1. Asignaciones N:M

- [x] 1.1 Implementar modelo Asignacion + repo (unique userId+ligaId) y verificar crear 201 / duplicada 409 + tests con fakes
- [x] 1.2 Implementar `POST/DELETE /ligas/:id/admins` (solo admin_usuarios, assignee debe ser admin_partidos) y verificar 201/204, 403 para admin_partidos, 404 destino inexistente + tests
- [x] 1.3 Implementar regla mínimo-1 (422 al quitar último admin) y cascade al borrar liga, y verificar ambos + tests
- [x] 1.4 Implementar middleware requireLigaAccess + scoping en writes de ligas/partidos/convocatorias/eventos y verificar 403 asignado-vs-no-asignado y 403 con 0 ligas + tests de matriz

## 2. Login y creación

- [x] 2.1 Extender login con `misLigas` (todas para admin_usuarios) y verificar contenido exacto + tests
- [x] 2.2 Implementar auto-asignación al crear liga (creador admin_partidos) y verificar que puede escribir de inmediato + tests
- [x] 2.3 Implementar backfill idempotente (admins existentes → todas las ligas) + actualizar seed, y verificar en BD limpia y con datos

## 3. Auditoría Nivel 2

- [x] 3.1 Agregar `createdBy {userId, username}` snapshot en liga/partido/convocatoria/evento (actor del token) y verificar que se guarda + que legacy lee null + tests
- [x] 3.2 Exponer `createdBy` (+createdAt) en detalle de liga/partido (convocatorias/eventos incluidos) y verificar ficha muestra quién cargó qué + tests
- [x] 3.3 Extender matriz de permisos E2E (scope por liga + auditoría) y verificar suite completa verde

## 4. Cierre

- [x] 4.1 Verificar gates (`tsc --noEmit`, `lint`, `test:unit` con cobertura dominio) y documentar contrato nuevo en README (asignaciones, misLigas, createdBy, 403 por scope) con ejemplos curl
