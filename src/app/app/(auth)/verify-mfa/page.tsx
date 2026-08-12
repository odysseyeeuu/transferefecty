import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { VerifyMfaForm } from "./verify-mfa-form";

export const metadata: Metadata = { title: "Verificación en dos pasos" };

export default async function VerifyMfaPage() {
  const session = await getSession();
  if (!session?.userId || !session.mfaPending) {
    redirect("/app/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ge-text-primary)]">
          Verificación en dos pasos
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Ingresa el código de 6 dígitos de tu app de autenticación.
        </p>
      </div>
      <VerifyMfaForm />
    </div>
  );
}
