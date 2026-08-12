"use client";

import { useActionState } from "react";
import { verifyMfaCode } from "@/app/actions/auth";

export function VerifyMfaForm() {
  const [state, formAction, pending] = useActionState(verifyMfaCode, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        name="token"
        inputMode="numeric"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        autoFocus
        placeholder="123456"
        className="rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-3 text-center text-2xl tracking-[0.4em] text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]"
      />
      {state?.message && (
        <p className="text-sm text-[var(--ge-error)]">{state.message}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius)] px-4 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Verificando…" : "Verificar"}
      </button>
    </form>
  );
}
