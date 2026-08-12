"use client";

import { useActionState } from "react";
import { executeStake, unstake } from "@/app/actions/stake";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

interface Plan {
  id: number;
  name: string;
  currency: string;
  apyPercent: number;
  minAmount: number;
  lockDays: number;
}

export function StakeForm({ plans }: { plans: Plan[] }) {
  const [state, formAction, pending] = useActionState(executeStake, undefined);

  return (
    <form action={formAction} className="ge-card flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--ge-text-secondary)]">Plan</label>
        <select name="planId" className={fieldClass}>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.apyPercent}% APY · mín. {p.minAmount} {p.currency} ·{" "}
              {p.lockDays > 0 ? `${p.lockDays} días` : "flexible"}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--ge-text-secondary)]">Monto a bloquear</label>
        <input name="amount" type="number" step="any" min="0" required className={fieldClass} />
      </div>
      {state?.message && <p className="text-sm text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius)] px-4 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Procesando…" : "Crear CDT"}
      </button>
    </form>
  );
}

export function UnstakeButton({ stakeId }: { stakeId: number }) {
  const [state, formAction, pending] = useActionState(unstake, undefined);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="stakeId" value={stakeId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius-sm)] px-3 py-1.5 text-xs font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-cyan)" }}
      >
        {pending ? "…" : "Retirar"}
      </button>
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
    </form>
  );
}
