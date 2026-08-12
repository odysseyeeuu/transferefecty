"use client";

import { useActionState } from "react";
import { executeSwap } from "@/app/actions/swap";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

export function SwapForm({ feePercent }: { feePercent: number }) {
  const [state, formAction, pending] = useActionState(executeSwap, undefined);

  return (
    <form action={formAction} className="ge-card flex flex-col gap-4 p-5">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-[var(--ge-text-secondary)]">De</label>
          <select name="fromCurrency" defaultValue="BTC" className={fieldClass}>
            {CRYPTO_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-[var(--ge-text-secondary)]">A</label>
          <select name="toCurrency" defaultValue="USDT" className={fieldClass}>
            {CRYPTO_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--ge-text-secondary)]">Monto a intercambiar</label>
        <input
          name="amount"
          type="number"
          step="any"
          min="0"
          required
          className={fieldClass}
        />
      </div>

      <p className="text-xs text-[var(--ge-text-muted)]">
        Comisión: {feePercent}% sobre el monto de origen. El intercambio se ejecuta al instante.
      </p>

      {state?.message && <p className="text-sm text-[var(--ge-error)]">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius)] px-4 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Procesando…" : "Intercambiar"}
      </button>
    </form>
  );
}
