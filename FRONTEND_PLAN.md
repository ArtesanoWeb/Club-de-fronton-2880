# Plan de arranque — Frontend

Complementa a [`FRONTEND_BRIEF.md`](./FRONTEND_BRIEF.md) (que tiene el contexto, la API y el "qué construir en qué orden" a alto nivel). Este documento es el "cómo empezar": pasos concretos, en orden, con los archivos a crear.

No avances a una fase sin haber probado la anterior contra el backend real corriendo en `localhost:3000` (ver instrucciones de arranque en `FRONTEND_BRIEF.md`).

## Fase 0 — Configuración base (antes de cualquier pantalla)

1. **Tema visual**: definir los 4 colores de marca como variables CSS en `src/app/globals.css` (o `tailwind.config`) — ver paleta en [`frontend/public/brand/BRAND.md`](./frontend/public/brand/BRAND.md). Tema **claro** (fondo crema), no oscuro.
2. **Componentes shadcn/ui necesarios** — ya está inicializado (`button` existe). Agregar los que hacen falta para las primeras fases:
   ```bash
   npx shadcn@latest add input form card dialog dropdown-menu avatar badge table tabs select sonner
   ```
3. **Variables de entorno**: crear `frontend/.env.local` con `NEXT_PUBLIC_API_URL=http://localhost:3000`.
4. **Cliente HTTP**: `src/lib/api/client.ts` — wrapper de `fetch` que:
   - Antepone `NEXT_PUBLIC_API_URL` a cada request.
   - Agrega `Authorization: Bearer <accessToken>` cuando hay sesión.
   - Si la respuesta es 401, intenta `POST /auth/refresh` una vez con el `refreshToken` y reintenta la request original; si el refresh también falla, limpia la sesión.
5. **Store de sesión**: `src/lib/store/auth-store.ts` con Zustand — `{ user, accessToken, refreshToken, setSession(), clearSession() }`. Persistir en `localStorage` (vía middleware `persist` de Zustand) como primera iteración simple.
6. **TanStack Query**: `src/app/providers.tsx` con el `QueryClientProvider`, envolviendo `src/app/layout.tsx`.
7. **Funciones de API por recurso** (una por módulo del backend, todas usando el cliente del paso 4):
   - `src/lib/api/auth.ts` → `register()`, `login()`, `logout()`, `me()`
   - `src/lib/api/players.ts` → `getPlayers()`, `getPlayer(id)`, `updateMe()`, `updatePlayer(id)`
   - `src/lib/api/seasons.ts` → `getSeasons()`, `getSeason(id)`, `createSeason()`, `updateSeason()`, `deleteSeason()`
   - `src/lib/api/matches.ts` → `getMatches()`, `getMatch(id)`, `createMatch()`
   - Tipar cada payload/respuesta copiando exactamente los DTOs del backend (ver tablas en `FRONTEND_BRIEF.md`).

## Fase 1 — Auth

1. `src/app/(auth)/login/page.tsx` y `src/app/(auth)/register/page.tsx` — formularios con `react-hook-form` + validación (espejo de los DTOs: password min 8, name min 2).
2. Al loguear/registrar exitosamente: guardar sesión en el store, redirigir a `/`.
3. `src/components/user-menu.tsx` — muestra estado de sesión en el header (login/registro si no hay sesión; nombre + logout si hay).
4. Wrapper de ruta protegida: `src/components/require-auth.tsx` (o `middleware.ts`) que redirige a `/login` si no hay `accessToken` válido. Usarlo en cualquier página que dependa de sesión.
5. Wrapper de ruta admin: `src/components/require-role.tsx` que además valida `user.role === "ADMIN"` (403/página de "no autorizado" si no cumple).
6. **Probar**: registrar un usuario real contra el backend, loguear, verificar que el refresh automático funciona dejando expirar el access token (15 min) o bajando `JWT_ACCESS_EXPIRES_IN` temporalmente en `backend/.env`.

## Fase 2 — Jugadores

1. `src/app/jugadores/page.tsx` — lista pública (`GET /players`), usar `PlayerCard` (componente nuevo, reutilizable).
2. `src/app/jugadores/[id]/page.tsx` — detalle público.
3. `src/app/dashboard/perfil/page.tsx` — protegido (`require-auth`), formulario que consume `PATCH /players/me` (nickname, foto, mano dominante, estilo de juego).
4. **Probar**: crear 2-3 jugadores vía `/register`, verificar que aparecen en el listado y que cada uno puede editar solo su propio perfil.

## Fase 3 — Temporadas

1. `src/app/temporadas/page.tsx` + `src/app/temporadas/[id]/page.tsx` — públicos.
2. `src/app/admin/temporadas/page.tsx` — protegido con `require-role("ADMIN")`. Tabla con las temporadas + diálogo de creación/edición + confirmación de borrado.
3. **Probar**: como usuario `PLAYER` normal, confirmar que `/admin/temporadas` redirige/bloquea; como `ADMIN` (promovido manualmente en la base, ver `FRONTEND_BRIEF.md`), confirmar CRUD completo.

## Fase 4 — Registro de partidos

1. `src/app/admin/partidos/nuevo/page.tsx` — protegido, solo `ADMIN`. Formulario con:
   - Select de modalidad (`TEMPORADA_OFICIAL`, `REY_DE_CANCHA`, `RETO`, `AMISTOSO`).
   - Select de temporada, **obligatorio solo si modalidad === TEMPORADA_OFICIAL** (mostrar/ocultar dinámicamente).
   - Selectores de 4 jugadores distintos, repartidos en Equipo A / Equipo B (bloquear duplicados en el propio formulario antes de enviar).
   - Marcador de ambos equipos (validar que no sean iguales antes de enviar).
   - Select de MVP opcional, limitado a los 4 jugadores ya seleccionados.
   - Duración (min) y notas, opcionales.
2. `src/app/partidos/page.tsx` — listado público simple (tarjetas con "Equipo A vs Equipo B — marcador", fecha, modalidad) mientras no exista el módulo de Match History dedicado.
3. **Probar**: registrar un partido de cada modalidad, confirmar en la base (o pidiéndome que lo verifique) que el ranking ELO se actualizó excepto en `AMISTOSO`.

## Fase 5 — Bloqueada por backend

Rankings/estadísticas visuales (Chart.js/Recharts), Match History con filtros, Landing Page final, Calendario, Feed Social, Reglamento, Level Up. No arrancar estas pantallas hasta que existan los endpoints de lectura correspondientes — coordinar antes de avanzar aquí.

## Checklist de higiene por fase

- `npm run build` y `npm run lint` sin errores antes de dar una fase por terminada.
- Probar el flujo real en el navegador contra el backend corriendo (no solo que compile).
- No commitear sin que el usuario lo pida explícitamente.
