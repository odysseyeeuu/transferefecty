# Plan de migración de datos — MySQL (v1) → Postgres (v2)

Esto sólo se ejecuta **una vez**, el día del corte a producción con v2 (o
antes, contra una copia, para practicar). No hace falta para seguir
desarrollando — el desarrollo normal usa `prisma/seed.ts` con datos de
prueba.

## Por qué no es un simple dump/restore

MySQL y Postgres no son binariamente compatibles, y además el esquema de v2
tiene cambios deliberados (ver `docs/ARQUITECTURA.md`):

- Se **elimina** la columna `password_plain` de `users` (no se migra: es
  texto plano de contraseñas reales, no debe existir en ningún lado).
- `mfa_secret` (texto plano en v1) pasa a `mfaSecretEncrypted` — hay que
  **cifrarlo** durante la migración con `APP_ENCRYPTION_KEY`, no copiarlo tal cual.
- Los `ENUM` de MySQL pasan a `enum` nativos de Postgres (incompatibilidad de
  sintaxis, no de datos — los valores string son los mismos).
- Los `TINYINT(1)` pasan a `boolean`.
- Los IDs pasan de `BIGINT UNSIGNED AUTO_INCREMENT` a `Int @default(autoincrement())`
  de Postgres — si el volumen de datos real se acerca a 2^31 filas en alguna
  tabla (muy improbable para este proyecto), cambiar a `BigInt` en el schema
  antes de migrar.

## Pasos recomendados

1. **Congelar escritura en producción v1** (ventana de mantenimiento corta) o
   aceptar que las últimas transacciones antes del corte se migran a mano.
2. **Exportar cada tabla de MySQL a CSV**, respetando el orden de FKs (padres
   antes que hijos): `offices` → `users` → `office_deposit_wallets`,
   `wallets`, `transactions`, `swaps`, `stake_plans` → `user_stakes`,
   `payment_methods`, `transfer_banks`, `support_tickets` →
   `support_messages`, `support_chats` → `support_chat_messages`,
   `contact_messages`, `password_resets`, `platform_settings`,
   `deposit_requests`, `kyc_documents`, `admin_logs`, `notifications`.
   ```sql
   -- Ejemplo por tabla, ejecutar en el MySQL de producción (phpMyAdmin → Exportar,
   -- o por CLI):
   SELECT * FROM offices INTO OUTFILE '/tmp/offices.csv'
     FIELDS TERMINATED BY ',' ENCLOSED BY '"' LINES TERMINATED BY '\n';
   ```
3. **Correr `prisma db push`** (o `migrate deploy`) contra la Postgres de v2
   para crear el esquema vacío.
4. **Script de migración** (Node/TS, un archivo por tabla o uno genérico):
   lee cada CSV, transforma los campos que cambian de forma:
   - `users`: quitar `password_plain`; cifrar `mfa_secret` → `mfaSecretEncrypted`
     con `encryptSecret()` (`src/lib/auth/crypto.ts`) si `mfa_enabled = 1`.
   - `*` con TINYINT(1): convertir `0/1` → `false/true`.
   - Fechas: MySQL `DATETIME` → Postgres `timestamp` (formato compatible, no
     debería necesitar transformación más allá del parseo).
   - `JSON` (meta, details, attachments, destination_details): ya vienen como
     JSON string, Prisma los acepta directo como `Json`.
   Insertar con `db.<modelo>.createMany({ data: [...], skipDuplicates: true })`
   en lotes de ~500 filas.
5. **Verificar conteos** por tabla (`SELECT COUNT(*)` en ambos lados) y
   sumas de control en tablas de dinero (`SUM(balance)` por moneda en
   `wallets`, `SUM(amount)` en `transactions` por tipo) — deben coincidir
   exactamente.
6. **Re-generar** `office.code`/`code_date` del día con
   `ensureFreshOfficeCodes()` (o dejar que se regenere solo en el primer
   `findActiveOfficeByCode` post-migración).
7. **No migrar** `storage/uploads/*` (archivos KYC/chat) por FTP/SFTP directo
   a Vercel Blob / R2 hasta tener el storage de v2 conectado — mientras tanto,
   dejar `kyc_documents.filePath` apuntando a las rutas viejas y servir esos
   archivos desde un endpoint puente si hace falta acceso durante la
   transición.
8. **Smoke test** con las cuentas reales de `admin@globalefecty.com` y un
   par de clientes reales (no demo) antes de apagar la v1.

## Cosas a decidir antes de migrar en serio (no bloquean desarrollo)

- ¿Migración en caliente (dual-write un tiempo) o corte directo con ventana
  de mantenimiento? Para el volumen de este proyecto, corte directo con
  ventana corta es razonable.
- Quién genera y valida el script de migración (recomendado: no improvisarlo
  el mismo día — practicarlo contra un dump de prueba primero).
