"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { GlitchText } from "@/components/motion/glitch-text";

const LINKS = [
  { href: "#features", label: "Funciones" },
  { href: "#how", label: "Cómo funciona" },
  { href: "#earn", label: "CDT" },
  { href: "#security", label: "Seguridad" },
  { href: "#faq", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ge-border)] bg-[var(--ge-bg-primary)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <GlitchText text="Transfer Efecty" as="span" className="text-lg font-bold" />

        <nav className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--ge-text-secondary)] hover:text-[var(--ge-text-primary)]">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/app/login" className="text-sm font-medium text-[var(--ge-text-secondary)] hover:text-[var(--ge-text-primary)]">
            Iniciar sesión
          </Link>
          <Link
            href="/app/register"
            className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-sm font-medium text-[var(--ge-text-inverse)]"
            style={{ background: "var(--ge-gradient-brand)" }}
          >
            Crear cuenta gratis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-[var(--ge-text-primary)] md:hidden"
          aria-label="Abrir menú"
        >
          {open ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-3 border-t border-[var(--ge-border)] px-6 py-4 md:hidden">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-[var(--ge-text-secondary)]" onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Link href="/app/login" className="text-sm font-medium text-[var(--ge-text-secondary)]">
              Iniciar sesión
            </Link>
            <Link
              href="/app/register"
              className="rounded-[var(--ge-radius-sm)] px-4 py-2 text-center text-sm font-medium text-[var(--ge-text-inverse)]"
              style={{ background: "var(--ge-gradient-brand)" }}
            >
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
