# Paridad de funcionalidad v1 → v2

Checklist de todo lo que existe en la v1 (`www/`) y su estado en v2. Objetivo:
que v2 termine haciendo **todo** lo que hace v1, en la nueva base técnica.

Leyenda: ✅ hecho y funcional · 🟡 esqueleto/parcial · ⬜ pendiente

**Estado general:** el flujo completo (cliente + admin) está implementado y
compila. Todo lo listado como ✅ usa Postgres/Prisma real, no datos de
ejemplo — falta conectar una base de datos real (Neon) y probarlo end-to-end
con datos de verdad.

## Auth / cuenta

| Ruta v1 | Ruta v2 | Estado | Notas |
|---|---|---|---|
| `/app/login` | `/app/login` | ✅ | Server Action `login()`, MFA-aware |
| `/app/register` | `/app/register` | ✅ | Valida código de oficina, crea wallets por defecto |
| `/app/logout` | `/app/logout` | ✅ | Route Handler, borra cookie de sesión |
| `/app/verify-mfa` | `/app/verify-mfa` | ✅ | TOTP con `otpauth`, secreto cifrado |
| `/app/settings` | `/app/settings` | ✅ | Perfil, cambio de contraseña, estado 2FA |
| `/app/settings/mfa-setup` | `/app/settings/mfa-setup` | ✅ | QR (api.qrserver.com, igual que v1) + activar/desactivar |
| `/app/update-password` | `/app/update-password` | ✅ | Consume el token de `password_resets` (?token=) y actualiza la contraseña |
| `/app/force-password-change` | `/app/force-password-change` | ✅ | Gate real en `(dashboard)/layout.tsx`: si `forcePasswordChange=true`, redirige aquí antes de mostrar cualquier pantalla |
| `/app/forgot-password` | `/app/forgot-password` | ✅ | Genera token + fila en `password_resets`; el envío de correo pasa por `src/lib/mail.ts`, que hoy hace `console.warn` en vez de mandar de verdad (falta `RESEND_API_KEY`) |

## Wallet / dinero (cliente)

| Ruta v1 | Ruta v2 | Estado | Notas |
|---|---|---|---|
| `/app/dashboard` | `/app/dashboard` | ✅ | Balances reales + últimas transacciones |
| `/app/wallets` | `/app/wallets` | ✅ | Balances + valor USD + wallets de depósito de la oficina |
| `/app/wallet/receive` | `/app/wallet/receive` | ✅ | QR (api.qrserver.com) + dirección |
| `/app/wallet/send` | `/app/wallet/send` | ✅ | Debita saldo y registra transacción `send` (igual que v1: no transfiere a otro usuario interno) |
| `/app/swap` | `/app/swap` | ✅ | Sólo el flujo **instantáneo**. La v1 tenía un segundo flujo de swaps "pendientes de aprobación admin" (columna `admin_note`, añadida por un upgrade SQL posterior al schema base) — no se portó |
| `/app/stake` | `/app/stake` | ✅ | Crear CDT + retirar (unstake) con cálculo de rendimiento proporcional |
| `/app/market` | `/app/market` | ✅ | Precios en vivo (CoinGecko, cache 120s vía Next.js Data Cache) |
| `/app/transactions` | `/app/transactions` | ✅ | Últimos 50 movimientos |
| `/app/payments` | `/app/payments` | ✅ | Depósito/retiro — **sólo canal crypto** (bank/card con métodos de pago guardados no se portó) |
| `/app/marketplace/swap` | `/app/marketplace/swap` | ✅ | Redirect a `/app/swap` — igual que la v1 (mismo controller) |
| `/app/marketplace/stake/plans` | `/app/marketplace/stake/plans` | ✅ | Redirect a `/app/stake` — igual que la v1 (mismo controller) |

## Soporte / cuenta (cliente)

| Ruta v1 | Ruta v2 | Estado | Notas |
|---|---|---|---|
| `/app/chat` | `/app/chat` | ✅ | Chat en vivo por oficina — **sin polling/realtime** (recarga tras enviar) y sin adjuntos de imagen |
| `/app/support` + ticket | `/app/support`, `/app/support/ticket/[id]` | ✅ | Crear ticket, ver hilo, responder |
| `/app/verification` | `/app/verification` | ✅ | Subida KYC (4 documentos) + estado |
| `/app/notifications` | `/app/notifications` | ✅ | Lista + marcar leída/todas |

## Admin

| Ruta v1 | Ruta v2 | Estado | Notas |
|---|---|---|---|
| `/admin/dashboard` | `/admin/dashboard` | ✅ | Contadores reales |
| `/admin/payments` | `/admin/payments` | ✅ | Aprobar/rechazar con nota visible al cliente. Simplificado: sin "editar monto antes de aprobar" ni "revertir aprobación" de la v1 |
| `/admin/kyc` | `/admin/kyc` | ✅ | Cola por oficina, aprobar/rechazar por documento + "aprobar todos" |
| `/admin/credit` | `/admin/credit` | ✅ | Crédito/débito manual con auditoría |
| `/admin/swaps` | `/admin/swaps` | ✅ | Auditoría de swaps (sólo lectura — ver nota de swap arriba) |
| `/admin/stake-plans` | `/admin/stake-plans` | ✅ | Crear y activar/desactivar planes (SuperAdmin) |
| `/admin/users` | `/admin/users` | ✅ | Listado con filtros (búsqueda, rol, KYC) |
| `/admin/my-users` | `/admin/my-users` | ✅ | Listado de clientes de la oficina |
| `/admin/user/[id]` | `/admin/user/[id]` | ✅ | Perfil, permisos (`allow_*`), rol/oficina (SuperAdmin), reset de contraseña, eliminar |
| `/admin/workers`, `/admin/create-worker` | ídem | ✅ | Listado + alta de SuperWorker |
| `/admin/admins`, `/admin/create-admin` | ídem | ✅ | Listado + alta de SuperAdmin |
| `/admin/offices` | `/admin/offices` | ✅ | CRUD + código diario vigente. La sub-vista de "producción por rango de fechas" de la v1 no se portó |
| `/admin/deposit-wallets` | `/admin/deposit-wallets` | ✅ | SuperWorker administra las de su oficina; SuperAdmin ve todas (solo lectura) |
| `/admin/transfer-banks` | `/admin/transfer-banks` | ✅ | CRUD |
| `/admin/tickets`, `/admin/ticket/[id]` | ídem | ✅ | Bandeja + detalle + respuesta + cambio de estado |
| `/admin/chats`, `/admin/chat/[id]` | ídem | ✅ | Bandeja + detalle + respuesta + cerrar |
| `/admin/notifications` | `/admin/notifications` | ✅ | Envío a un usuario / oficina / todos, con filtro KYC (simplificado: "sin documentos" en vez de "< 4 tipos subidos") |
| `/admin/general` | `/admin/general` | ✅ | `platform_settings` (nombre, fees, mínimos, anuncio, mantenimiento) |
| `/admin/actions` | `/admin/actions` | ✅ | Lectura de `admin_logs` |
| `/admin/database` | `/admin/database` | ⬜ | No se portará tal cual — usar Prisma Studio (`npm run db:studio`) o el panel de Neon en su lugar |
| `/admin/production` | `/admin/production` | ⬜ | Stub — reporte de producción por oficina/fecha |

## Landing pública

| v1 | v2 | Estado |
|---|---|---|
| `www/views/landing/index.php` | `src/app/page.tsx` | ✅ | Hero, ticker de precios en vivo, stats, features, cómo funciona, CDT (con planes reales de la BD), seguridad, FAQ, CTA — mismo copy que la v1. Sin el video de fondo ni las animaciones de partículas (decorativo, no crítico) |
| `/contact` (POST) | Formulario en la landing (`#contacto`) | ✅ | Server Action `submitContactMessage` → `contact_messages` |
| `/sitemap.xml`, `robots.txt` | `src/app/sitemap.ts`, `src/app/robots.ts` | ✅ | Convenciones nativas de Next.js |

## Simplificaciones deliberadas (documentadas para no sorprender a nadie)

- **Sin `password_plain`**: la v1 guardaba la contraseña en texto plano; v2 nunca lo hace.
- **Pagos**: sólo canal crypto en depósito/retiro. Bank/card con métodos de pago
  guardados y alta "al vuelo" de método de pago no se portaron.
- **Swap**: sólo el flujo instantáneo. El flujo de aprobación admin (con
  `swaps.admin_note`) no existía en el schema base y no se portó.
- **Chat**: sin tiempo real (polling/WebSockets) ni adjuntos de imagen.
- **Archivos KYC**: resuelto — `src/lib/storage.ts` usa Vercel Blob
  (`access: "private"`) cuando existe `BLOB_READ_WRITE_TOKEN`, y disco local
  en desarrollo. Se sirven sólo vía `/storage/[...path]` con verificación de
  permisos. Ver `docs/ARQUITECTURA.md`.
- **Correo**: `src/lib/mail.ts` implementa toda la lógica (reset de
  contraseña, etc.) pero el transporte real está stub — sin `RESEND_API_KEY`
  configurado, sólo hace `console.warn` con el contenido. Funciona de punta a
  punta apenas se agregue esa env var, no hay que tocar el código que lo llama.
- **`/admin/database`**: reemplazado por Prisma Studio / panel de Neon.
- **`/admin/production`, oficinas → producción por rango**: reportes no portados.

## Cómo usar este documento

Cuando se porte una pantalla pendiente: cambiar su fila a ✅ y anotar aquí
cualquier decisión de producto distinta a la v1.
