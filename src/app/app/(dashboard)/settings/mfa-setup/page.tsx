import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { generateMfaSecret } from "@/lib/auth/mfa";
import { MfaSetupForm } from "./mfa-setup-form";

export const metadata: Metadata = { title: "Configurar 2FA" };

export default async function MfaSetupPage() {
  const user = await requireUser();
  if (user.mfaEnabled) redirect("/app/settings");

  // Se genera un secreto nuevo en cada visita a esta página (a diferencia de
  // la v1, que lo fijaba en la sesión PHP). Si el usuario refresca antes de
  // confirmar, simplemente escanea el QR de nuevo — sin impacto de seguridad.
  const { otpauthUrl, encryptedForStorage } = generateMfaSecret(user.email);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUrl)}`;

  return (
    <div className="flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">
          Configurar autenticación en dos pasos
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Escanea este código con Google Authenticator, Authy o similar, y confirma con el
          código de 6 dígitos.
        </p>
      </div>

      <div className="ge-card flex flex-col items-center gap-4 p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrSrc} alt="QR 2FA" width={200} height={200} className="rounded-[var(--ge-radius)]" />
        <MfaSetupForm encryptedSecret={encryptedForStorage} />
      </div>
    </div>
  );
}
