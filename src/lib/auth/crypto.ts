import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

/**
 * Cifrado simétrico (AES-256-GCM) para datos sensibles en reposo que sí
 * necesitamos poder leer de vuelta (a diferencia de la contraseña, que sólo
 * se hashea). Uso principal: `mfaSecretEncrypted` en la tabla `users`.
 *
 * La v1 en PHP guardaba `mfa_secret` en texto plano en la base de datos.
 * Aquí lo ciframos con una clave que vive solo en variables de entorno
 * (nunca en la base de datos ni en el repo).
 */

function getKey(): Buffer {
  const secret = process.env.APP_ENCRYPTION_KEY;
  if (!secret || secret.length < 32) {
    throw new Error(
      "APP_ENCRYPTION_KEY no está definido o es demasiado corto (mínimo 32 caracteres). " +
        "Generar uno con: openssl rand -base64 32"
    );
  }
  return scryptSync(secret, "global-efecty-v2-salt", 32);
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((b) => b.toString("base64")).join(".");
}

export function decryptSecret(payload: string): string {
  const [ivB64, authTagB64, dataB64] = payload.split(".");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
