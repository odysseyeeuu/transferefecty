import { LogoLink } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: "var(--ge-bg-primary)" }}
    >
      {/* Halo de marca, muy tenue, para que la pantalla de acceso no se vea plana */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[520px] -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--ge-gradient-brand)" }}
      />

      <div className="relative mb-8">
        <LogoLink href="/" height={52} priority />
      </div>
      <div className="ge-card relative w-full max-w-md p-8">{children}</div>
    </main>
  );
}
