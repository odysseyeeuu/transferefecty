import "server-only";
import { randomBytes } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Puerto de `www/src/Helpers/WalletHelper.php`. Las funciones que reciben
 * `tx` opcional pueden usarse dentro de un `db.$transaction()` más grande
 * (igual que la v1 encadenaba todo dentro de una transacción PDO).
 */

type Db = PrismaClient | Prisma.TransactionClient;

export async function ensureWallet(client: Db, userId: number, currency: string) {
  const code = currency.toUpperCase();
  const existing = await client.wallet.findUnique({
    where: { userId_currency: { userId, currency: code } },
  });
  if (existing) return existing;

  const address = `${code.toLowerCase()}_${randomBytes(12).toString("hex")}`;
  return client.wallet.create({
    data: { userId, currency: code, balance: 0, address },
  });
}

export async function getBalance(userId: number, currency: string): Promise<number> {
  const wallet = await db.wallet.findUnique({
    where: { userId_currency: { userId, currency: currency.toUpperCase() } },
  });
  return wallet ? Number(wallet.balance) : 0;
}

/**
 * Suma (o resta, con delta negativo) saldo de forma atómica — un UPDATE
 * condicionado a que el resultado no quede negativo, para que dos requests
 * concurrentes no puedan sobre-retirar (equivalente al `SELECT ... FOR
 * UPDATE` + chequeo de la v1, pero expresado como UPDATE atómico de Postgres).
 * Devuelve `false` si no había saldo suficiente (o la wallet no existe).
 */
export async function adjustBalance(
  client: Db,
  userId: number,
  currency: string,
  delta: number
): Promise<boolean> {
  const code = currency.toUpperCase();
  await ensureWallet(client, userId, code);

  const result = await client.$executeRaw`
    UPDATE wallets
    SET balance = balance + ${delta}, "updated_at" = now()
    WHERE user_id = ${userId} AND currency = ${code} AND balance + ${delta} >= 0
  `;
  return result > 0;
}

export async function recordTransaction(
  client: Db,
  params: {
    userId: number;
    type:
      | "deposit"
      | "withdrawal"
      | "swap"
      | "stake"
      | "unstake"
      | "reward"
      | "adjustment"
      | "send"
      | "receive";
    currency: string;
    amount: number;
    status?: "pending" | "completed" | "failed" | "cancelled";
    description?: string | null;
    fee?: number;
    adminId?: number | null;
  }
) {
  return client.transaction.create({
    data: {
      userId: params.userId,
      type: params.type,
      currency: params.currency.toUpperCase(),
      amount: params.amount,
      status: params.status ?? "completed",
      description: params.description ?? null,
      fee: params.fee ?? 0,
      adminId: params.adminId ?? null,
    },
  });
}
