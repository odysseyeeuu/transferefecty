import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { ForcePasswordForm } from "./force-password-form";

export const metadata: Metadata = { title: "Cambio de contraseña obligatorio" };

export default async function ForcePasswordChangePage() {
  await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ge-text-primary)]">
          Cambio de contraseña obligatorio
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Un administrador solicitó que actualices tu contraseña antes de continuar.
        </p>
      </div>
      <ForcePasswordForm />
    </div>
  );
}
