# Arquitectura — Transfer Efecty v2

Decisiones de stack y por qué, para no tener que volver a discutirlas cada vez
que se retome el proyecto.

## Stack

| Capa | v1 (actual) | v2 |
|---|---|---|
| Lenguaje/framework | PHP 8.1 vanilla (MVC propio) | **Next.js 16 (App Router) + TypeScript** |
| Hosting | cPanel compartido + FTP manual | **Vercel** (Node.js runtime) |
| Control de versiones / CI | Ninguno (no hay `.git`) | **GitHub → Vercel** (deploy automático, preview por PR) |
| Base de datos | MySQL/MariaDB | **Postgres** (Neon o Vercel Postgres) |
| Acceso a datos | SQL a mano (PDO) | **Prisma** (`prisma/schema.prisma`) |
| Auth | Sesiones PHP nativas + TOTP en claro | **Sesión JWT firmada (jose) + TOTP (otpauth) con secreto cifrado** |
| Contraseñas | bcrypt + copia en texto plano (`password_plain`) | **bcrypt, sin copia en texto plano** |
| Archivos (KYC, chat) | Disco local del servidor (`storage/uploads`) | **Vercel Blob / Cloudflare R2** con URLs firmadas (pendiente de conectar) |
| Estilos | CSS a mano + `marca/tokens.css` | **Tailwind CSS v4**, mismos tokens de marca (`src/app/globals.css`) |
| Validación | A mano en cada controlador | **Zod** (`src/lib/validations/`) |

## Por qué Postgres en vez de seguir con MySQL

Se decidió con el cliente (ver conversación de arranque de v2): mejor
integración nativa con el ecosistema Vercel/Prisma, y mejor soporte de tipos
(`Decimal`, `jsonb`) para una app que mueve dinero. El costo es que la
migración de datos reales (ver `MIGRACION-DATOS.md`) no es un simple dump/restore.

## Por qué Next.js 16 (y qué cambia respecto a lo que la mayoría conoce)

Next.js 16 introdujo cambios que rompen patrones "clásicos" de App Router:

- **`middleware.ts` está deprecado** → ahora es `src/proxy.ts` con función
  `proxy()`. Ver `src/proxy.ts` en este repo.
- **`PageProps<Route>` / `LayoutProps<Route>`** son helpers de tipos
  auto-generados (por `next dev` / `next build` / `next typegen`) — no hace
  falta tipar `params`/`searchParams` a mano en la mayoría de páginas.
- Antes de escribir código nuevo contra el App Router, conviene mirar
  `node_modules/next/dist/docs/01-app/` en este proyecto — Next.js 16 empaqueta
  su propia documentación versionada ahí, más confiable que "lo que ya sabías"
  de versiones anteriores.

## Por qué no NextAuth/Auth.js

Se evaluó, pero en el momento de crear este scaffold NextAuth estaba en beta
para Next.js 16 (framework recién salido) — añadir esa capa de riesgo no
compensaba. En su lugar se implementó el patrón que la propia guía de
autenticación de Next.js recomienda como base (`src/lib/auth/`):

- `session.ts` — sesión JWT firmada (HS256) en cookie httpOnly, vía `jose`.
- `dal.ts` — Data Access Layer: `verifySession()`, `getCurrentUser()`,
  `requireRole()`. **Todo** Server Component/Action/Route Handler que necesite
  saber quién es el usuario pasa por aquí — nunca se lee la cookie directamente
  fuera de esta capa.
- `password.ts` — hash/verify con bcrypt (mismo costo que la v1: 12).
- `mfa.ts` + `crypto.ts` — TOTP con secreto cifrado en reposo (AES-256-GCM),
  a diferencia de la v1 que guardaba `mfa_secret` en texto plano.
- `src/proxy.ts` — chequeo **optimista** (solo lee la cookie, sin ir a BD)
  para redirigir rápido; nunca es la única barrera — cada Server
  Action/Route Handler vuelve a verificar con la DAL.

Si más adelante se quiere pasar a un proveedor gestionado (Auth.js, Clerk,
WorkOS…), esta capa se puede reemplazar sin tocar el resto de la app porque
todo pasa por `dal.ts`.

## Estructura de carpetas

```
v2/
├── prisma/
│   ├── schema.prisma      → 21 tablas, traducidas 1:1 desde import-phpmyadmin.sql
│   └── seed.ts            → datos de prueba (equivalente a los INSERT de la v1)
├── src/
│   ├── proxy.ts           → protección de rutas /app y /admin (reemplaza middleware.ts)
│   ├── app/
│   │   ├── layout.tsx, page.tsx        → raíz + landing
│   │   ├── actions/auth.ts             → Server Actions (login, registro, logout, MFA)
│   │   ├── app/(auth)/...              → login, registro, forgot-password, verify-mfa
│   │   ├── app/(dashboard)/...         → dashboard, wallets, swap, stake, etc. (cliente)
│   │   └── admin/...                   → panel admin (SuperAdmin / SuperWorker)
│   ├── components/         → AppSidebar, AdminSidebar
│   └── lib/
│       ├── db.ts            → cliente Prisma (singleton)
│       ├── auth/             → password, session, dal, mfa, crypto
│       ├── office-code.ts   → código diario de oficina (puerto de OfficeCodeService.php)
│       ├── config/currencies.ts
│       └── validations/     → esquemas Zod
└── docs/
    ├── ARQUITECTURA.md      → este archivo
    ├── PARIDAD.md            → checklist de qué falta portar
    └── MIGRACION-DATOS.md    → plan para pasar datos reales de MySQL a Postgres
```

## Estado del port funcional

Toda la lógica de negocio (auth, KYC, wallets, pagos, swap, CDT/stake, tickets,
chat, panel admin completo) ya está implementada contra Postgres/Prisma real
— ver el detalle ruta por ruta en `docs/PARIDAD.md`. Lo que queda pendiente es
sobre todo **infraestructura de producción**, no funcionalidad:

1. ~~**Storage de archivos**~~ — ✅ **resuelto**. `src/lib/storage.ts` ahora
   tiene dos backends y elige solo: si existe `BLOB_READ_WRITE_TOKEN` usa
   **Vercel Blob** con `access: "private"`; si no, disco local (desarrollo).
   Los blobs privados no son accesibles por URL — sólo a través de
   `/storage/[...path]`, que verifica permisos (dueño / superadmin /
   superworker de la misma oficina) antes de servir el archivo, y responde con
   `Cache-Control: private, no-store`. En la BD se sigue guardando la misma
   ruta relativa (`kyc/….jpg`) con cualquiera de los dos backends, así que
   cambiar de uno a otro no requiere migrar datos.
   **Para activarlo en producción:** crear un Blob store en Vercel
   (Storage → Blob) — Vercel inyecta `BLOB_READ_WRITE_TOKEN` automáticamente.
2. **Envío de correo** (reset de contraseña, notificaciones): Resend/Postmark.
   La v1 usaba `mail()` del hosting, poco confiable. `/app/forgot-password`
   sigue siendo un stub por esto.
3. **Rate limiting** de login/OTP/registro: Upstash Redis + `@upstash/ratelimit`.
4. **Chat en tiempo real**: hoy `/app/chat` y `/admin/chat/[id]` recargan tras
   enviar (sin polling ni WebSockets). Evaluar Pusher/Ably/Supabase Realtime o
   un polling simple con `useSWR` si hace falta antes de producción.
5. **Monitoreo**: Sentry (hoy la v1 no tiene ninguno).
6. **Notificaciones masivas admin** (`/admin/notifications`) y **reporte de
   producción por oficina** (`/admin/production`, sub-vista de `/admin/offices`)
   siguen siendo stubs — ver `docs/PARIDAD.md`.
