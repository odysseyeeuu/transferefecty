"use client";

import { useActionState, useState } from "react";
import { requestDeposit, requestWithdrawal } from "@/app/actions/payments";
import { CRYPTO_CURRENCIES, NETWORKS_BY_CURRENCY } from "@/lib/config/currencies";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";

function CurrencyNetworkFields({ prefix }: { prefix: string }) {
  const [currency, setCurrency] = useState("USDT");
  const networks = NETWORKS_BY_CURRENCY[currency] ?? [];

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--ge-text-secondary)]">Moneda</label>
        <select
          name="currency"
          className={fieldClass}
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CRYPTO_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-[var(--ge-text-secondary)]">Red</label>
        <select name="network" className={fieldClass} key={`${prefix}-${currency}`}>
          {networks.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function DepositForm() {
  const [state, formAction, pending] = useActionState(requestDeposit, undefined);

  return (
    <form action={formAction} className="ge-card flex flex-col gap-3 p-4">
      <h3 className="font-medium text-[var(--ge-text-primary)]">Depositar</h3>
      <CurrencyNetworkFields prefix="dep" />
      <input
        name="amount"
        type="number"
        step="any"
        min="0"
        required
        placeholder="Monto"
        className={fieldClass}
      />
      <textarea
        name="notes"
        placeholder="Notas (opcional)"
        rows={2}
        className={fieldClass}
      />
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Enviando…" : "Solicitar depósito"}
      </button>
    </form>
  );
}

export function WithdrawalForm() {
  const [state, formAction, pending] = useActionState(requestWithdrawal, undefined);

  return (
    <form action={formAction} className="ge-card flex flex-col gap-3 p-4">
      <h3 className="font-medium text-[var(--ge-text-primary)]">Retirar</h3>
      <CurrencyNetworkFields prefix="wd" />
      <input
        name="amount"
        type="number"
        step="any"
        min="0"
        required
        placeholder="Monto"
        className={fieldClass}
      />
      <input
        name="address"
        required
        placeholder="Dirección de destino"
        className={fieldClass}
      />
      <textarea
        name="notes"
        placeholder="Notas (opcional)"
        rows={2}
        className={fieldClass}
      />
      {state?.message && <p className="text-xs text-[var(--ge-error)]">{state.message}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-[var(--ge-radius)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Enviando…" : "Solicitar retiro"}
      </button>
    </form>
  );
}
