import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * TEMPORAL — endpoint de diagnóstico de despliegue.
 *
 * Reporta SOLO si cada variable de entorno está presente (booleano) y si la
 * conexión a Postgres funciona. NUNCA devuelve el valor de ninguna variable.
 * Se elimina en cuanto se confirme que el despliegue está sano.
 */
export async function GET() {
  const env = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    DIRECT_URL: Boolean(process.env.DIRECT_URL),
    SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
    SESSION_SECRET_len: (process.env.SESSION_SECRET ?? "").length,
    APP_ENCRYPTION_KEY: Boolean(process.env.APP_ENCRYPTION_KEY),
    APP_ENCRYPTION_KEY_len: (process.env.APP_ENCRYPTION_KEY ?? "").length,
    APP_URL: Boolean(process.env.APP_URL),
    MAIL_FROM: Boolean(process.env.MAIL_FROM),
  };

  let dbOk = false;
  let dbError: string | null = null;
  let userCount: number | null = null;
  let stakePlanCount: number | null = null;

  try {
    userCount = await db.user.count();
    stakePlanCount = await db.stakePlan.count();
    dbOk = true;
  } catch (err) {
    dbError = err instanceof Error ? err.message.slice(0, 300) : String(err).slice(0, 300);
  }

  return NextResponse.json({ env, dbOk, dbError, userCount, stakePlanCount });
}
