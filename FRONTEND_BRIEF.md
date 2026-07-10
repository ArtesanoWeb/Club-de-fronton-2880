# Frontend brief — Plataforma Club de Frontón Boliviano

Este documento es el punto de partida para quien (o el agente que) continúe el desarrollo del `frontend/`. Resume qué existe hoy, cómo levantarlo, la API completa disponible y el orden sugerido de trabajo. La especificación completa del producto está en `Reporte Proyecto Club Fronton Bolivia.pdf` y en `CLAUDE.md`/`.agents/proyecto.md` (raíz del repo) — léelos si falta contexto de negocio.

## Estado actual del repo

- `backend/`: NestJS + TypeScript + Prisma 7 + PostgreSQL. **Funcional y probado**, cubre Auth, Players, Seasons y Match Registration (con ranking ELO automático). Ver API completa abajo.
- `frontend/`: Next.js 16 + TypeScript + Tailwind v4 (App Router, `src/`). Solo el scaffold por defecto de `create-next-app` + shadcn/ui inicializado (`components.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`). **No hay ninguna pantalla propia todavía.**
- Librerías ya instaladas en `frontend/package.json` pero sin usar: `zustand`, `@tanstack/react-query`, `framer-motion`, `chart.js` + `react-chartjs-2`, `recharts`.
- `docker-compose.yml` en la raíz levanta Postgres.

## Cómo levantar todo localmente

```bash
# 1. Postgres (requiere permisos de Docker del usuario; puede que debas correrlo tú)
docker compose -f "docker-compose.yml" up -d postgres

# 2. Backend
cd backend
npm install
npx prisma migrate dev   # solo si hay migraciones pendientes
npm run start:dev        # http://localhost:3000

# 3. Frontend — IMPORTANTE: el backend tiene CORS configurado para
# http://localhost:3001 por defecto (ver backend/src/main.ts, var FRONTEND_URL).
# Next.js por defecto usa el puerto 3000, que choca con el backend.
cd frontend
npm install
npm run dev -- -p 3001   # http://localhost:3001
```

Si prefieres otro puerto para el frontend, exporta `FRONTEND_URL` en `backend/.env` antes de levantar el backend.

## Modelo de datos (Prisma) — para entender las respuestas de la API

- `User`: `id, email, role (PLAYER|ADMIN), createdAt, updatedAt` (nunca expone `passwordHash` ni `refreshToken`).
- `Player`: `id, userId, name, nickname?, photoUrl?, dominantHand? (LEFT|RIGHT), playStyle?, createdAt, updatedAt`.
- `Duo`: `id, player1Id, player2Id` — se crea automáticamente al registrar el primer partido de una pareja.
- `Season`: `id, name, startDate, endDate?, status (UPCOMING|ACTIVE|FINISHED), createdAt`.
- `Match`: `id, seasonId?, modality (TEMPORADA_OFICIAL|REY_DE_CANCHA|RETO|AMISTOSO), teamAId, teamBId, scoreA, scoreB, mvpPlayerId?, durationMinutes?, notes?, playedAt, createdAt`.
- `RankingIndividual` / `RankingDuo`: `points (ELO, base 1000), wins, losses, currentStreak (positivo=racha de victorias, negativo=de derrotas)`.

## API disponible (base `http://localhost:3000`)

Todas las rutas protegidas usan `Authorization: Bearer <accessToken>`. El `ValidationPipe` global rechaza (400) cualquier campo no declarado en el DTO o con formato inválido.

### Auth (`/auth`)
| Método | Ruta | Auth | Body | Notas |
|---|---|---|---|---|
| POST | `/auth/register` | — | `{ email, password (min 8), name (min 2), nickname? }` | Crea `User`+`Player` juntos, rol `PLAYER` fijo. Devuelve `{ user, accessToken, refreshToken }`. 409 si el email ya existe. |
| POST | `/auth/login` | — | `{ email, password }` | Devuelve `{ user, accessToken, refreshToken }`. 401 si credenciales inválidas. |
| POST | `/auth/refresh` | Bearer **refreshToken** | — | Rota ambos tokens. 403 si el refresh token no coincide o fue invalidado (p. ej. tras logout). |
| POST | `/auth/logout` | Bearer accessToken | — | Invalida el refresh token guardado. |
| GET | `/auth/me` | Bearer accessToken | — | Devuelve el `User` actual con su `Player` anidado. |

`accessToken` expira en 15 min, `refreshToken` en 7 días (config en `backend/.env`). El frontend necesita lógica de refresh automático (interceptor/retry en el cliente HTTP) — no existe todavía.

### Players (`/players`)
| Método | Ruta | Auth | Body | Notas |
|---|---|---|---|---|
| GET | `/players` | — (público) | — | Lista todos los jugadores con su `ranking` (puede ser `null` si nunca jugó). |
| GET | `/players/:id` | — (público) | — | 404 si no existe. |
| PATCH | `/players/me` | Bearer accessToken | `{ name?, nickname?, photoUrl?, dominantHand?, playStyle? }` | El jugador edita su propio perfil. |
| PATCH | `/players/:id` | Bearer accessToken + rol `ADMIN` | igual que arriba | Admin edita a cualquiera. 403 si no es admin. |

### Seasons (`/seasons`)
| Método | Ruta | Auth | Body | Notas |
|---|---|---|---|---|
| GET | `/seasons` | — (público) | — | Ordenadas por `startDate` desc. |
| GET | `/seasons/:id` | — (público) | — | 404 si no existe. |
| POST | `/seasons` | rol `ADMIN` | `{ name (min 2), startDate (ISO), endDate?, status? }` | 409 si el nombre ya existe. |
| PATCH | `/seasons/:id` | rol `ADMIN` | mismos campos, todos opcionales | |
| DELETE | `/seasons/:id` | rol `ADMIN` | — | 204 sin body. |

### Matches (`/matches`)
| Método | Ruta | Auth | Body | Notas |
|---|---|---|---|---|
| GET | `/matches` | — (público) | — | Incluye `season`, `mvpPlayer`, `teamA`/`teamB` con `player1`/`player2` anidados. Orden por `playedAt` desc. |
| GET | `/matches/:id` | — (público) | — | 404 si no existe. |
| POST | `/matches` | rol `ADMIN` | `{ seasonId?, modality, teamA: [playerIdA1, playerIdA2], teamB: [playerIdB1, playerIdB2], scoreA, scoreB, mvpPlayerId?, durationMinutes?, notes?, playedAt? }` | Ver reglas abajo. |

Reglas de negocio de `POST /matches` que el frontend debe reflejar en el formulario/UX:
- `scoreA` no puede ser igual a `scoreB` (sin empates).
- Los 4 jugadores (`teamA` + `teamB`) deben ser distintos entre sí.
- `mvpPlayerId`, si se envía, debe ser uno de los 4 jugadores del partido.
- Si `modality === "TEMPORADA_OFICIAL"`, `seasonId` es obligatorio.
- Modalidad `AMISTOSO` **no actualiza ranking** — es la única excepción; las demás modalidades sí disparan el recálculo ELO de forma automática en el backend (nada que hacer en frontend salvo mostrarlo).

### Lo que NO existe todavía en el backend (no construir pantallas que dependan de esto aún)
- Endpoints de **lectura** de rankings/tablas de posición (`GET /seasons/:id/standings`, ranking histórico) — los datos ya se calculan y persisten en cada partido, pero no hay endpoint expuesto todavía.
- Estadísticas agregadas (individuales, por dupla, del club), Match History con filtros/head-to-head, Calendario, Feed Social, Reglamento, Sistema Level Up/XP.
- Registro público (todo usuario que se registra es `PLAYER`; no hay flujo de invitación/promoción a `ADMIN` vía API — se hace directo en base de datos).

## Diseño visual — identidad de marca real (prioriza esto sobre la spec del PDF)

**Importante:** el PDF original describía una estética "oscura, inspirada en dashboards de esports". Los assets de marca reales del club (logo + paleta, definidos 2026-07-10) contradicen eso — son un sello clásico de club social (crema, verde bosque, dorado, burdeos), no un tema oscuro de gaming. **Usa la paleta real, no la descripción genérica del PDF.**

Detalle completo del logo y la paleta en [`frontend/public/brand/BRAND.md`](./frontend/public/brand/BRAND.md). Resumen:

| Nombre | Hex | Uso sugerido |
|---|---|---|
| Verde Bosque | `#0F3D2E` | Primario — texto, bordes, acentos fuertes |
| Crema Cálido | `#F3EDE2` | Fondo base (tema claro, no oscuro) |
| Dorado | `#C8A15A` | Acento secundario — detalles, hover |
| Burdeos | `#7A1F2B` | Énfasis — CTAs, badges, MVP |

Configurar estos colores como tema de Tailwind/shadcn desde el inicio (`tailwind.config` / variables CSS), en vez de un dark mode por defecto.

## Orden sugerido para el frontend (según lo que ya soporta el backend)

Plan de arranque paso a paso, con archivos concretos a crear en cada fase: [`FRONTEND_PLAN.md`](./FRONTEND_PLAN.md).

1. **Cliente HTTP + estado de auth**: wrapper fetch/axios con TanStack Query, manejo de `accessToken`/`refreshToken` (dónde guardarlos — sugerido: `accessToken` en memoria/Zustand, `refreshToken` en cookie httpOnly si se agrega un endpoint intermedio, o localStorage como primera iteración simple), interceptor de refresh automático en 401, store de sesión con Zustand.
2. **Pantallas de Auth**: `/register`, `/login`, logout, ruta protegida (middleware o wrapper de layout) que redirige si no hay sesión.
3. **Directorio y perfil de jugadores**: lista pública (`/players`), detalle de jugador (`/players/[id]`), formulario de edición del propio perfil (`/dashboard/profile` o similar) consumiendo `PATCH /players/me`.
4. **Temporadas**: lista pública (`/seasons`), detalle (`/seasons/[id]`), y un panel admin (`/admin/seasons`) con CRUD completo, visible solo si `role === "ADMIN"`.
5. **Registro de partidos (admin)**: formulario en `/admin/matches/new` que implementa exactamente las reglas de negocio listadas arriba (selector de modalidad, selector de 4 jugadores distintos repartidos en 2 equipos, marcador, MVP opcional). Vista pública de historial simple en `/matches` mientras no exista el módulo de Match History dedicado.
6. **A partir de aquí queda bloqueado por backend**: rankings/estadísticas visuales (Chart.js/Recharts) requieren que se construyan los endpoints de lectura correspondientes primero — coordinar con el backend antes de avanzar a esa parte.

## Convenciones ya establecidas (seguir para consistencia)

- Commits en inglés, formato imperativo corto + cuerpo explicando el "por qué" (ver `git log` para ejemplos), firmados con `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` si el agente es Claude.
- No commitear `node_modules/`, `.next/`, `dist/`, `.env`, `.claude/`, `.agents/` — ya cubiertos por los `.gitignore` existentes.
- El repo remoto es `https://github.com/ArtesanoWeb/Club-de-fronton-2880.git`; el usuario prefiere hacer `git push` él mismo desde su propia terminal en vez de que el agente lo haga (no tiene credenciales cacheadas en el entorno del agente).
