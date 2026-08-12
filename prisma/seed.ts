/**
 * Seed de desarrollo — equivalente a los INSERT de prueba al final de
 * `www/database/import-phpmyadmin.sql`. Uso: `npm run db:seed`.
 *
 * Contraseña de todas las cuentas demo: `Demo1234` (a diferencia de la v1,
 * aquí NO se guarda en texto plano — sólo el hash).
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const DEMO_PASSWORD = "Demo1234";

// Mismo formato que src/lib/office-code.ts: el código diario sólo es válido
// si `codeDate` es HOY (hora Bogotá). Lo fijamos a hoy para poder registrar
// un usuario de prueba inmediatamente después de sembrar.
const TODAY_BOGOTA = new Date(
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date())
);

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const central = await db.office.upsert({
    where: { name: "Oficina Central" },
    update: { code: "CEN000", codeDate: TODAY_BOGOTA },
    create: {
      name: "Oficina Central",
      code: "CEN000",
      codeDate: TODAY_BOGOTA,
      isActive: true,
    },
  });

  await db.office.upsert({
    where: { name: "Oficina Norte" },
    update: { code: "NOR000", codeDate: TODAY_BOGOTA },
    create: {
      name: "Oficina Norte",
      code: "NOR000",
      codeDate: TODAY_BOGOTA,
      isActive: true,
    },
  });

  const admin = await db.user.upsert({
    where: { email: "admin@transferefecty.com" },
    update: {},
    create: {
      fullName: "Administrador Global",
      email: "admin@transferefecty.com",
      passwordHash,
      role: "superadmin",
      kycStatus: "approved",
      emailVerified: true,
      country: "Colombia",
    },
  });

  const worker = await db.user.upsert({
    where: { email: "superworker@transferefecty.com" },
    update: {},
    create: {
      fullName: "SuperWorker",
      email: "superworker@transferefecty.com",
      passwordHash,
      role: "superworker",
      officeId: central.id,
      kycStatus: "approved",
      emailVerified: true,
      country: "Colombia",
    },
  });

  const demo = await db.user.upsert({
    where: { email: "demo@transferefecty.com" },
    update: {},
    create: {
      fullName: "DEMO Usuario",
      email: "demo@transferefecty.com",
      passwordHash,
      role: "user",
      officeId: central.id,
      kycStatus: "approved",
      emailVerified: true,
      country: "Colombia",
    },
  });

  const wallets: Array<[number, string, number, string]> = [
    [demo.id, "BTC", 0.4523, "1A1z7agoat2GPFH7pPPSTAYUM1GTqQD5b"],
    [demo.id, "ETH", 2.15, "0x742d35Cc6634C0532925a3b844Bc9e7595f42D1"],
    [demo.id, "USDT", 12500, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"],
    [demo.id, "BNB", 15.5, "bnb1grpf0955h0ykzq3ar5nmum690e5wj93yd4xwl"],
    [demo.id, "SOL", 120, "11111111111111111111111111111111"],
  ];

  for (const [userId, currency, balance, address] of wallets) {
    await db.wallet.upsert({
      where: { userId_currency: { userId, currency } },
      update: { balance },
      create: { userId, currency, balance, address },
    });
  }

  await db.stakePlan.createMany({
    skipDuplicates: true,
    data: [
      { name: "BTC Flexible", currency: "BTC", apyPercent: 4.5, minAmount: 0.001, lockDays: 0 },
      { name: "BTC Locked 30D", currency: "BTC", apyPercent: 8.2, minAmount: 0.005, lockDays: 30 },
      { name: "ETH Flexible", currency: "ETH", apyPercent: 5.0, minAmount: 0.01, lockDays: 0 },
      { name: "ETH Locked 60D", currency: "ETH", apyPercent: 12.5, minAmount: 0.05, lockDays: 60 },
      { name: "USDT Stable", currency: "USDT", apyPercent: 6.8, minAmount: 100, lockDays: 30 },
    ],
  });

  await db.platformSetting.createMany({
    skipDuplicates: true,
    data: [
      { key: "site_name", value: "Transfer Efecty" },
      { key: "support_email", value: "support@transferefecty.com" },
      { key: "swap_fee_percent", value: "0.1" },
      { key: "maintenance_mode", value: "0" },
      { key: "min_deposit_usd", value: "10" },
      { key: "min_withdrawal_usd", value: "20" },
      { key: "default_country", value: "Colombia" },
    ],
  });

  console.log("Seed OK:");
  console.log(`  superadmin: ${admin.email} / ${DEMO_PASSWORD}`);
  console.log(`  superworker: ${worker.email} / ${DEMO_PASSWORD}`);
  console.log(
    `  cliente demo: ${demo.email} / ${DEMO_PASSWORD} (código oficina para registro: CEN000, válido hoy)`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
