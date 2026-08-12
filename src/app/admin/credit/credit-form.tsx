"use client";

import { useActionState } from "react";
import { creditOrDebitFunds } from "@/app/actions/admin-funds";
import { CRYPTO_CURRENCIES, NETWORKS_BY_CURRENCY } from "@/lib/config/currencies";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-sm text-[var(--ge-text-primary)] outline-none";

export function CreditForm() {
  const [state, formAction, pending] = useActionState(creditOrDebitFunds, undefined);

  return (
    <form action={formAction} className="ge-card flex flex-wrap items-end gap-3 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--ge-text-secondary)]">Usuario (ID o email)</label>
        <input name="user" required className={`${fieldClass} w-56`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--ge-text-secondary)]">Moneda</label>
        <select name="currency" defaultValue="USDT" className={fieldClass}>
          {CRYPTO_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--ge-text-secondary)]">Red</label>
        <select name="network" className={fieldClass}>
          {(NETWORKS_BY_CURRENCY.USDT ?? []).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--ge-text-secondary)]">Monto</label>
        <input name="amount" type="number" step="any" min="0" required className={`${fieldClass} w-32`} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--ge-text-secondary)]">Operación</label>
        <select name="operation" className={fieldClass}>
          <option value="credit">Crédito (+)</option>
          <option value="debit">Débito (-)</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-[var(--ge-text-secondary)]">Nota</label>
        <input name="note" className={`${fieldClass} w-56`} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Aplicando…" : "Aplicar"}
      </button>

      {state?.error && <p className="w-full text-sm text-[var(--ge-error)]">{state.error}</p>}
      {state?.success && <p className="w-full text-sm text-[var(--ge-success)]">{state.success}</p>}
    </form>
  );
}
