import type { Metadata } from "next";
import Link from "next/link";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ge-text-primary)]">
          Crea tu cuenta
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Necesitas el código diario de tu oficina (formato ABC123).
        </p>
      </div>
      <RegisterForm />
      <div className="text-sm text-[var(--ge-text-secondary)]">
        ¿Ya tienes cuenta?{" "}
        <Link href="/app/login" className="hover:text-[var(--ge-cyan)]">
          Inicia sesión
        </Link>
      </div>
    </div>
  );
}
