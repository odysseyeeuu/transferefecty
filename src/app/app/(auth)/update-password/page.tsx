import type { Metadata } from "next";
import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = { title: "Nueva contraseña" };

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ge-text-primary)]">Nueva contraseña</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Elige una nueva contraseña para tu cuenta.
        </p>
      </div>
      {token ? (
        <UpdatePasswordForm token={token} />
      ) : (
        <p className="text-sm text-[var(--ge-error)]">
          Enlace inválido — falta el token. Solicita uno nuevo desde{" "}
          <a href="/app/forgot-password" className="text-[var(--ge-cyan)]">
            recuperar contraseña
          </a>
          .
        </p>
      )}
    </div>
  );
}
