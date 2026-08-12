import "server-only";
import bcrypt from "bcryptjs";

// bcryptjs (implementación 100% JS, sin bindings nativos) para que funcione
// igual en local, en build de Vercel y en Edge sin pasos extra de compilación.
// Mismo costo (12) que usaba la v1 en PHP (`password_hash(..., PASSWORD_BCRYPT, ['cost' => 12])`).
const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Reglas mínimas de contraseña para cuentas nuevas. La v1 no validaba nada
 * server-side más allá de "no vacío"; en v2 exigimos un mínimo razonable
 * para una app que mueve dinero.
 */
export function isPasswordStrongEnough(plain: string): boolean {
  return (
    plain.length >= 8 &&
    /[a-zA-Z]/.test(plain) &&
    /[0-9]/.test(plain)
  );
}
