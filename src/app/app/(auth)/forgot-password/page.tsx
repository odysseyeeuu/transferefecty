import type { Metadata } from "next";
import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = { title: "Recuperar contraseña" };

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--ge-text-primary)]">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">
          Ingresa tu correo y te enviamos un enlace para crear una nueva contraseña.
        </p>
      </div>
      <ForgotPasswordForm />
      <Link href="/app/login" className="text-sm text-[var(--ge-cyan)]">
        Volver a iniciar sesión
      </Link>
    </div>
  );
}
