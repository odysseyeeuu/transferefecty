import { PrismaClient } from "@prisma/client";

// Patrón estándar de Prisma + Next.js: en dev, `next dev` recarga módulos en
// caliente y crearía un PrismaClient nuevo por cada cambio de archivo,
// agotando las conexiones de Postgres. Lo guardamos en `globalThis` para
// reusar la misma instancia entre recargas.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
