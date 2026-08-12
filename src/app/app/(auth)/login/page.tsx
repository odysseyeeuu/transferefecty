import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ge-text-primary)]">
          Inicia sesión
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Accede a tu billetera Transfer Efecty.
        </p>
      </div>
      <LoginForm />
      <div className="flex justify-between text-sm text-[var(--ge-text-secondary)]">
        <Link href="/app/forgot-password" className="hover:text-[var(--ge-cyan)]">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/app/register" className="hover:text-[var(--ge-cyan)]">
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}
