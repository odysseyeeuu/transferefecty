"use client";

import { useActionState } from "react";
import { forcePasswordChange } from "@/app/actions/settings";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

export function ForcePasswordForm() {
  const [state, formAction, pending] = useActionState(forcePasswordChange, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        name="password"
        type="password"
        placeholder="Nueva contraseña"
        required
        autoComplete="new-password"
        className={fieldClass}
      />
      <input
        name="confirmPassword"
        type="password"
        placeholder="Confirmar contraseña"
        required
        autoComplete="new-password"
        className={fieldClass}
      />
      {state?.message && <p className="text-sm text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius)] px-4 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Guardando…" : "Cambiar contraseña"}
      </button>
    </form>
  );
}
