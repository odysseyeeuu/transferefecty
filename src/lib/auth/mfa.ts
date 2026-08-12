import "server-only";
import { TOTP, Secret } from "otpauth";
import { encryptSecret, decryptSecret } from "@/lib/auth/crypto";

/**
 * TOTP (Google Authenticator / Authy) — equivalente a `MfaService` en la v1.
 * El secreto se guarda cifrado (`mfaSecretEncrypted`), nunca en claro.
 */

const ISSUER = "Transfer Efecty";

export function generateMfaSecret(email: string) {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  return {
    base32Secret: secret.base32,
    otpauthUrl: totp.toString(),
    encryptedForStorage: encryptSecret(secret.base32),
  };
}

export function verifyMfaToken(encryptedSecret: string, token: string): boolean {
  const base32Secret = decryptSecret(encryptedSecret);
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(base32Secret),
  });

  // window: 1 tolera +/-30s de desfase de reloj entre el server y el celular.
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}
