"use client";

import { useActionState } from "react";
import { updatePassword } from "@/app/actions/settings";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(updatePassword, undefined);

  return (
    <form action={formAction} className="ge-card flex flex-col gap-3 p-4">
      <input
        name="currentPassword"
        type="password"
        placeholder="Contraseña actual"
        required
        autoComplete="current-password"
        className={fieldClass}
      />
      <input
        name="newPassword"
        type="password"
        placeholder="Nueva contraseña"
        required
        autoComplete="new-password"
        className={fieldClass}
      />
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirmar nueva contraseña"
        required
        autoComplete="new-password"
        className={fieldClass}
      />
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
