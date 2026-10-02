## Why

Las páginas, componentes y hooks de `acsed-web` llaman directamente al transporte HTTP con URLs escritas a mano. Esa dispersión dificulta probar, sustituir el transporte y mantener consistentes los endpoints y parámetros.

## What Changes

- Crear una capa de servicios por dominio sobre el cliente HTTP existente.
- Encapsular URLs, métodos, parámetros, consultas y tipos de entrada/salida.
- Inyectar el transporte mediante fábricas de servicios y un único composition root.
- Migrar gradualmente las llamadas directas existentes hacia los servicios.
- Mantener intacto el comportamiento observable de la aplicación.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- None. Este es un refactor interno sin cambios de comportamiento a nivel de specs.

## Impact

- Frontend: nuevos módulos de servicios y actualización gradual de páginas, hooks y componentes.
- Pruebas: servicios probables con transporte falso; pruebas existentes del transporte siguen cubriendo `fetch`, token y errores.
- API y backend: sin cambios.
- Sin nuevas dependencias previstas.
