"use client";

import { useActionState } from "react";
import { createSuperAdmin } from "@/app/actions/admin-staff";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none";

export function CreateAdminForm() {
  const [state, formAction, pending] = useActionState(createSuperAdmin, undefined);

  return (
    <form action={formAction} className="ge-card flex max-w-md flex-col gap-3 p-4">
      <input name="fullName" placeholder="Nombre completo" required className={fieldClass} />
      <input name="email" type="email" placeholder="Email" required className={fieldClass} />
      <input name="password" type="password" placeholder="Contraseña" required className={fieldClass} />
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirmar contraseña"
        required
        className={fieldClass}
      />
      <label className="flex items-center gap-2 text-xs text-[var(--ge-text-secondary)]">
        <input type="checkbox" name="forcePasswordChange" />
        Forzar cambio de contraseña en el próximo login
      </label>
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Creando…" : "Crear administrador"}
      </button>
    </form>
  );
}
