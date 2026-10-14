## 1. Footer component

- [x] 1.1 `App.tsx`: add `Footer` (brand, Ligas/Copas + Stats links, Instagram `@fcacsed` external, `Temporada {new Date().getFullYear()}`), rendered below `main`
- [x] 1.2 `App.tsx`: style band `bg-cancha-950 text-white`, container `max-w-2xl mx-auto`, links `min-h-11`
- [x] 1.3 Test: footer shows mirror links, Instagram href `https://www.instagram.com/fcacsed` with `target _blank`, and current year
- [x] 1.4 Refinamientos: layout `min-h-dvh flex flex-col` (footer contra el borde inferior), links subrayados sin bordes, dos columnas (navegación izquierda, redes derecha)

## 2. Gates

- [x] 2.1 `npx tsc --noEmit` + `npm run lint` + `npx vitest run` + `npm run build` in `acsed-web`
