"use client";

import { useActionState } from "react";
import { register } from "@/app/actions/auth";

const fieldClass =
  "rounded-[var(--ge-radius-sm)] border border-[var(--ge-border)] bg-[var(--ge-bg-elevated)] px-3 py-2 text-[var(--ge-text-primary)] outline-none focus:border-[var(--ge-violet)]";
const labelClass = "text-sm text-[var(--ge-text-secondary)]";
const errorClass = "text-xs text-[var(--ge-error)]";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="fullName" className={labelClass}>
          Nombre completo
        </label>
        <input id="fullName" name="fullName" required className={fieldClass} />
        {state?.errors?.fullName && (
          <p className={errorClass}>{state.errors.fullName[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>
          Correo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={fieldClass}
        />
        {state?.errors?.email && <p className={errorClass}>{state.errors.email[0]}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClass}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className={fieldClass}
        />
        {state?.errors?.password && (
          <p className={errorClass}>{state.errors.password[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className={labelClass}>
            País (opcional)
          </label>
          <input id="country" name="country" className={fieldClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className={labelClass}>
            Teléfono (opcional)
          </label>
          <input id="phone" name="phone" className={fieldClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="officeCode" className={labelClass}>
          Código de oficina
        </label>
        <input
          id="officeCode"
          name="officeCode"
          required
          placeholder="ABC123"
          maxLength={6}
          className={`${fieldClass} uppercase`}
        />
        {state?.errors?.officeCode && (
          <p className={errorClass}>{state.errors.officeCode[0]}</p>
        )}
      </div>

      {state?.message && <p className={errorClass}>{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-[var(--ge-radius)] px-4 py-2.5 font-medium text-[var(--ge-text-inverse)] disabled:opacity-60"
        style={{ background: "var(--ge-gradient-brand)" }}
      >
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </button>
    </form>
  );
}
