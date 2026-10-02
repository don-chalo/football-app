## Context

`acsed-web` usa un transporte HTTP compartido directamente desde páginas, componentes y hooks. Las URLs y cuerpos de petición están dispersos, lo que dificulta sustituir el transporte en pruebas y mantener consistentes los parámetros. See `proposal.md` for motivation.

## Goals / Non-Goals

**Goals:**

- Encapsular endpoints, parámetros y tipos por dominio.
- Permitir transporte real o falso mediante inyección de dependencias.
- Facilitar pruebas unitarias de servicios sin `fetch` global.
- Migrar gradualmente sin cambiar el comportamiento observable.

**Non-Goals:**

- No introducir clases, contenedores DI ni dependencias nuevas.
- No cambiar `usePolling` por otra solución de datos.
- No agregar validación runtime generalizada de respuestas.
- No mover reglas de negocio del backend al frontend.

## Decisions

### Fábricas funcionales por dominio

Cada dominio expondrá una fábrica que recibe el transporte y devuelve operaciones listas para usar. La dependencia se inyecta una vez, no en cada llamada.

Alternative considered: clases `XxxApiClient`. Rejected because the application is small and factories provide the same testability with less ceremony.

Alternative considered: pasar el transporte como argumento en cada llamada. Rejected because it burdens every call site and makes accidental use of the global transport more likely.

### Interfaz mínima de transporte

Se definirá una interfaz con las operaciones HTTP necesarias. El cliente actual será la implementación real y los tests usarán un falso con la misma forma.

Alternative considered: acoplar los servicios directamente a `fetch`. Rejected because it would preserve the current testing limitation.

### Un único composition root

Existirá un único módulo que construya los servicios con el transporte real. Páginas, hooks y componentes consumirán esos servicios ya construidos.

Alternative considered: que cada página construya sus servicios. Rejected because it would duplicate composition logic and permit inconsistent transports.

### Migración incremental por dominio

Primero se migrarán dominios con más escrituras y lógica, como partidos, eventos y convocatorias. Después se migrarán catálogos simples. El transporte directo quedará reservado como detalle interno.

Alternative considered: migrar todo en un solo cambio. Rejected because it increases review and regression risk.

### Decoradores funcionales opcionales

Capacidades transversales como logs o reintentos se implementarán envolviendo el transporte, no modificando los servicios.

Alternative considered: herencia o middleware acoplado a cada servicio. Rejected because it complicates the domain layer unnecessarily.

## Risks / Trade-offs

- [Risk] La migración parcial deja temporalmente dos estilos de acceso → Mitigation: migrar por dominio completo y registrar el transporte directo como excepción.
- [Risk] Un falso de transporte puede ocultar errores reales de red → Mitigation: conservar pruebas del transporte real con `fetch` mockeado.
- [Risk] Una interfaz demasiado amplia dificulta sustituciones → Mitigation: mantenerla limitada a las operaciones HTTP usadas.
- [Risk] El refactor puede parecer sin valor visible inmediato → Mitigation: medirlo por pruebas más simples y menos URLs duplicadas.

## Migration Plan

1. Crear la interfaz de transporte, fábricas y composition root.
2. Migrar partidos, eventos y convocatorias.
3. Migrar catálogos y administración.
4. Verificar que no queden llamadas directas fuera de la capa de servicios.
5. Revertir por dominio si alguna migración introduce una regresión.
