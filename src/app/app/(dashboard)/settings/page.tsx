import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { getSetting } from "@/lib/settings";
import { disableMfa } from "@/app/actions/settings";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Configuración" };

export default async function SettingsPage() {
  const user = await requireUser();
  const announcement = await getSetting("announcement", "");

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Configuración</h1>
        {announcement && (
          <p className="ge-card mt-3 px-4 py-3 text-sm text-[var(--ge-cyan)]">{announcement}</p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Perfil
        </h2>
        <div className="ge-card p-4 text-sm text-[var(--ge-text-secondary)]">
          <p>
            <span className="text-[var(--ge-text-muted)]">Nombre:</span> {user.fullName}
          </p>
          <p>
            <span className="text-[var(--ge-text-muted)]">Correo:</span> {user.email}
          </p>
          <p>
            <span className="text-[var(--ge-text-muted)]">País:</span> {user.country ?? "—"}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Contraseña
        </h2>
        <PasswordForm />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--ge-text-muted)]">
          Autenticación en dos pasos (2FA)
        </h2>
        <div className="ge-card flex items-center justify-between p-4">
          <p className="text-sm text-[var(--ge-text-secondary)]">
            {user.mfaEnabled ? "Activada ✅" : "Desactivada"}
          </p>
          {user.mfaEnabled ? (
            <form action={disableMfa}>
              <button
                type="submit"
                className="rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-inverse)]"
                style={{ background: "var(--ge-error)" }}
              >
                Desactivar
              </button>
            </form>
          ) : (
            <Link
              href="/app/settings/mfa-setup"
              className="rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-inverse)]"
              style={{ background: "var(--ge-gradient-brand)" }}
            >
              Activar
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
