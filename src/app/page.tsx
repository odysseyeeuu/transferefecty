import Link from "next/link";
import {
  Rocket,
  LogIn,
  IdCard,
  Lock,
  ArrowLeftRight,
  PiggyBank,
  Wallet,
  ShieldHalf,
  Building2,
  Headset,
  UserPlus,
  BanknoteArrowUp,
  ShieldAlert,
  Eye,
  Database,
  UserCheck,
  CircleCheck,
} from "lucide-react";
import { LandingNav } from "@/components/landing-nav";
import { ContactForm } from "@/components/contact-form";
import { SiteFooter } from "@/components/site-footer";
import { HeroVisual } from "@/components/landing/hero-visual";
import { FadeIn, StaggerGroup, staggerItem } from "@/components/motion/fade-in";
import { MotionDiv, MotionH1 } from "@/components/motion/motion-primitives";
import { getMarketData } from "@/lib/market";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";
import { db } from "@/lib/db";

export const revalidate = 120;

const FEATURES = [
  {
    icon: Wallet,
    title: "Wallet multi-cripto",
    body: "Gestiona las principales criptomonedas desde un panel unificado, con saldos y precios en tiempo real.",
  },
  {
    icon: ArrowLeftRight,
    title: "Swap instantáneo",
    body: "Intercambia criptos a tasa de mercado con comisión transparente del 0.1%.",
  },
  {
    icon: PiggyBank,
    title: "CDT cripto",
    body: "Bloquea fondos por un plazo y recibe rendimiento en porcentaje, como un ahorro digital.",
  },
  {
    icon: ShieldHalf,
    title: "Seguridad de nivel bancario",
    body: "Verificación KYC, cifrado de sesiones, monitoreo de IP y rate-limiting anti brute-force.",
  },
  {
    icon: Building2,
    title: "Transfer Int.",
    body: "Métodos bancarios internacionales con flujo claro por país y banco.",
  },
  {
    icon: Headset,
    title: "Soporte humano",
    body: "Tickets internos y respuesta en español con seguimiento de tu oficina.",
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Crea tu cuenta",
    body: "Regístrate con email y país. Verifica tu identidad en minutos con el KYC integrado.",
  },
  {
    icon: BanknoteArrowUp,
    title: "Deposita o compra",
    body: "Recibe cripto en tu wallet o solicita un depósito a través de los métodos disponibles.",
  },
  {
    icon: Rocket,
    title: "Opera y gana",
    body: "Intercambia con un solo clic o haz staking para generar rendimientos pasivos.",
  },
];

const SECURITY_ITEMS = [
  { icon: Lock, title: "Acceso seguro", body: "Inicio de sesión protegido con cifrado HTTPS y control de intentos." },
  { icon: IdCard, title: "KYC verificado", body: "Documento de identidad y prueba de domicilio para cumplimiento AML." },
  {
    icon: ShieldAlert,
    title: "Cifrado y rate-limiting",
    body: "Sesiones HTTPS-only, cookies Secure + HttpOnly, anti brute-force.",
  },
  { icon: Eye, title: "Monitoreo de acceso", body: "Registramos cada login y vigilamos accesos desde ubicaciones inusuales." },
];

const FAQ = [
  {
    q: "¿Qué es Transfer Efecty?",
    a: "Transfer Efecty es una billetera de criptomonedas multiactivo que te permite enviar, recibir, intercambiar (swap) y hacer staking de BTC, ETH, USDT, USDC, BNB, XRP, SOL, TRX y DOGE, con una experiencia diseñada para usuarios hispanohablantes.",
  },
  {
    q: "¿Cuánto cuesta usar Transfer Efecty?",
    a: "Crear tu cuenta es gratis. Las comisiones de swap empiezan en 0.1% — entre las más bajas del mercado. No cobramos comisiones por mantener saldo ni por recibir cripto. Los planes de staking tienen APY transparentes según el activo y el periodo de bloqueo.",
  },
  {
    q: "¿Es seguro? ¿Quién custodia mis fondos?",
    a: "Sí. Implementamos verificación KYC, cifrado de sesiones HTTPS-only, monitoreo de IPs, rate-limiting anti brute-force y registros de auditoría de cada acción administrativa.",
  },
  {
    q: "¿Qué criptomonedas puedo gestionar?",
    a: "Puedes gestionar BTC, ETH, USDT, USDC, BNB, XRP, SOL, TRX y DOGE, con precios y estadísticas en vivo.",
  },
  {
    q: "¿Cuánto demora un retiro?",
    a: "Los retiros se procesan manualmente para garantizar la seguridad. Una vez aprobados, el envío en la red blockchain demora según la congestión del activo (de minutos a 1 hora típicamente).",
  },
];

async function getFeaturedStakePlans() {
  // No tumbar el build/prerender de la landing si la base de datos aún no
  // está conectada (ej. build sin DATABASE_URL real) — degradar a lista
  // vacía en vez de fallar toda la página, igual que `getMarketData()`.
  try {
    return await db.stakePlan.findMany({
      where: { isActive: true },
      orderBy: { apyPercent: "desc" },
      take: 4,
    });
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const [market, stakePlans] = await Promise.all([getMarketData(), getFeaturedStakePlans()]);

  // Monedas del mockup del hero: saldos de ejemplo, pero con la variación 24h
  // real del mercado para que no se vea como una maqueta congelada.
  const HERO_AMOUNTS: Record<string, string> = {
    BTC: "0,2451",
    ETH: "3,80",
    USDT: "5.240,00",
    SOL: "42,5",
  };
  const heroCoins = ["BTC", "ETH", "USDT", "SOL"].map((code) => {
    const meta = CRYPTO_CURRENCIES.find((c) => c.code === code);
    const row = market.find((m) => m.code === code);
    return {
      code,
      name: meta?.name ?? code,
      amount: HERO_AMOUNTS[code],
      change: row?.change24h ?? 0,
      color: meta?.color ?? "#2563EB",
    };
  });

  return (
    <>
      <LandingNav />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-20 pt-14 sm:pt-20">
          {/* Fondo: malla + orbes de marca */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className="absolute -left-24 -top-24 size-[440px] rounded-full opacity-25 blur-3xl"
              style={{ background: "radial-gradient(circle, #2563EB, transparent 70%)" }}
            />
            <div
              className="absolute -right-20 top-24 size-[380px] rounded-full opacity-25 blur-3xl"
              style={{ background: "radial-gradient(circle, #22D3EE, transparent 70%)" }}
            />
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(37,99,235,.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,.07) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(ellipse at 50% 0%, #000 55%, transparent 85%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse at 50% 0%, #000 55%, transparent 85%)",
              }}
            />
          </div>

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            {/* Columna de texto */}
            <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
              <MotionDiv
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="ge-card inline-flex items-center gap-2 px-4 py-1.5 text-xs font-medium text-[var(--ge-text-secondary)]">
                  <span className="size-1.5 animate-pulse rounded-full bg-[var(--ge-success)]" />
                  Plataforma cripto global · Segura y en español
                </span>
              </MotionDiv>

              <MotionH1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-2xl text-4xl font-bold leading-[1.08] tracking-tight text-[var(--ge-text-primary)] sm:text-6xl"
              >
                Tu dinero se mueve{" "}
                <span className="ge-gradient-text">a la velocidad de internet</span>
              </MotionH1>

              <MotionDiv
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16 }}
                className="max-w-xl"
              >
                <p className="text-lg text-[var(--ge-text-secondary)]">
                  Envía, intercambia y haz crecer tus criptomonedas desde una sola billetera.
                  Comisiones desde{" "}
                  <strong className="text-[var(--ge-text-primary)]">0,1%</strong>, respaldo de tu
                  oficina y soporte en español.
                </p>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.24 }}
                className="flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              >
                <MotionDiv whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/app/register"
                    className="inline-flex items-center gap-2 rounded-[var(--ge-radius)] px-6 py-3.5 font-semibold text-[var(--ge-text-inverse)] shadow-lg shadow-blue-600/20"
                    style={{ background: "var(--ge-gradient-brand)" }}
                  >
                    <Rocket className="size-4" /> Crear cuenta gratis
                  </Link>
                </MotionDiv>
                <Link
                  href="/app/login"
                  className="ge-card inline-flex items-center gap-2 rounded-[var(--ge-radius)] px-6 py-3.5 font-semibold text-[var(--ge-text-primary)]"
                >
                  <LogIn className="size-4" /> Iniciar sesión
                </Link>
              </MotionDiv>

              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.34 }}
              >
                <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-[var(--ge-text-muted)] lg:justify-start">
                  <li className="flex items-center gap-1.5">
                    <IdCard className="size-3.5" /> KYC verificado
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Lock className="size-3.5" /> Cifrado E2E
                  </li>
                  <li className="flex items-center gap-1.5">
                    <ArrowLeftRight className="size-3.5" /> Swap ágil
                  </li>
                  <li className="flex items-center gap-1.5">
                    <PiggyBank className="size-3.5" /> CDT cripto
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Headset className="size-3.5" /> Soporte 24/7
                  </li>
                </ul>
              </MotionDiv>
            </div>

            {/* Columna visual */}
            <HeroVisual coins={heroCoins} />
          </div>
        </section>

        {/* Ticker */}
        <section className="border-y border-[var(--ge-border)] bg-[var(--ge-bg-secondary)] py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-6 text-sm">
            {market.map((row) => {
              const meta = CRYPTO_CURRENCIES.find((c) => c.code === row.code);
              const positive = row.change24h >= 0;
              return (
                <span key={row.code} className="flex items-center gap-2 text-[var(--ge-text-secondary)]">
                  <span className="font-semibold text-[var(--ge-text-primary)]">{meta?.code ?? row.code}</span>
                  ${row.price.toLocaleString("es-CO", { maximumFractionDigits: 4 })}
                  <span style={{ color: positive ? "var(--ge-success)" : "var(--ge-error)" }}>
                    {positive ? "▲" : "▼"} {Math.abs(row.change24h).toFixed(1)}%
                  </span>
                </span>
              );
            })}
          </div>
        </section>

        {/* Stats */}
        <section className="px-6 py-16">
          <StaggerGroup className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Usuarios activos", value: "48,000+" },
              { label: "Volumen mensual", value: "$125M+" },
              { label: "Países", value: "150+" },
              { label: "Comisión swap", value: "0.1%" },
            ].map((s) => (
              <MotionDiv key={s.label} variants={staggerItem} className="ge-card p-5 text-center">
                <p className="ge-gradient-text text-2xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs text-[var(--ge-text-muted)]">{s.label}</p>
              </MotionDiv>
            ))}
          </StaggerGroup>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <FadeIn className="mb-10 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ge-cyan)]">
                Funciones principales
              </span>
              <h2 className="mt-2 text-3xl font-bold text-[var(--ge-text-primary)]">
                Todo lo que necesitas en <span className="ge-gradient-text">una wallet</span>
              </h2>
              <p className="mt-2 text-[var(--ge-text-secondary)]">
                Diseñada para Latinoamérica y el mundo. Simple para empezar, potente para operar día a día.
              </p>
            </FadeIn>
            <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <MotionDiv key={f.title} variants={staggerItem} className="ge-card p-5" whileHover={{ y: -3 }}>
                  <f.icon className="mb-3 size-6 text-[var(--ge-violet-light)]" />
                  <h3 className="font-semibold text-[var(--ge-text-primary)]">{f.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">{f.body}</p>
                </MotionDiv>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <FadeIn className="mb-10 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ge-cyan)]">
                Empieza en 3 pasos
              </span>
              <h2 className="mt-2 text-3xl font-bold text-[var(--ge-text-primary)]">
                Tu primera operación en <span className="ge-gradient-text">menos de 5 minutos</span>
              </h2>
            </FadeIn>
            <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <MotionDiv key={s.title} variants={staggerItem} className="ge-card p-5" whileHover={{ y: -3 }}>
                  <span className="text-xs font-bold text-[var(--ge-text-muted)]">
                    0{i + 1}
                  </span>
                  <s.icon className="my-3 size-6 text-[var(--ge-cyan)]" />
                  <h3 className="font-semibold text-[var(--ge-text-primary)]">{s.title}</h3>
                  <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">{s.body}</p>
                </MotionDiv>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* Earn / CDT */}
        <section id="earn" className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <FadeIn className="mb-10 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ge-cyan)]">
                CDT / Staking
              </span>
              <h2 className="mt-2 text-3xl font-bold text-[var(--ge-text-primary)]">
                Pon tus criptos a <span className="ge-gradient-text">trabajar para ti</span>
              </h2>
              <p className="mt-2 text-[var(--ge-text-secondary)]">
                Rendimiento transparente · plazos claros · retiro al vencer.
              </p>
            </FadeIn>
            <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stakePlans.map((p) => {
                const meta = CRYPTO_CURRENCIES.find((c) => c.code === p.currency);
                return (
                  <MotionDiv
                    key={p.id}
                    variants={staggerItem}
                    whileHover={{ y: -3 }}
                    className="ge-card flex flex-col gap-3 p-5 text-center"
                  >
                    <span
                      className="mx-auto flex size-10 items-center justify-center rounded-full text-xs font-bold text-[var(--ge-text-inverse)]"
                      style={{ background: meta?.color ?? "var(--ge-violet)" }}
                    >
                      {p.currency.slice(0, 3)}
                    </span>
                    <p className="text-sm font-medium text-[var(--ge-text-primary)]">{p.name}</p>
                    <div>
                      <p className="text-xs text-[var(--ge-text-muted)]">APY anual</p>
                      <p className="ge-gradient-text text-2xl font-bold">{Number(p.apyPercent)}%</p>
                    </div>
                    <Link
                      href="/app/register"
                      className="ge-card rounded-[var(--ge-radius-sm)] py-2 text-xs font-medium text-[var(--ge-text-primary)]"
                    >
                      Hacer stake
                    </Link>
                  </MotionDiv>
                );
              })}
              {stakePlans.length === 0 && (
                <p className="col-span-full text-sm text-[var(--ge-text-secondary)]">
                  Planes disponibles próximamente.
                </p>
              )}
            </StaggerGroup>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="px-6 py-16">
          <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2">
            <FadeIn>
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ge-cyan)]">
                Seguridad
              </span>
              <h2 className="mt-2 text-3xl font-bold text-[var(--ge-text-primary)]">
                Tu dinero, <span className="ge-gradient-text">protegido como debe ser</span>
              </h2>
              <p className="mt-2 text-[var(--ge-text-secondary)]">
                Cumplimos con las mejores prácticas del sector cripto. Tu privacidad y la integridad de
                tus fondos son lo primero.
              </p>
              <ul className="mt-6 flex flex-col gap-4">
                {SECURITY_ITEMS.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <item.icon className="mt-0.5 size-5 shrink-0 text-[var(--ge-violet-light)]" />
                    <div>
                      <p className="font-medium text-[var(--ge-text-primary)]">{item.title}</p>
                      <p className="text-sm text-[var(--ge-text-secondary)]">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </FadeIn>
            <FadeIn delay={0.1} className="ge-card flex flex-col items-center gap-4 p-6 text-center">
              <ShieldHalf className="size-12 text-[var(--ge-cyan)]" />
              <h3 className="font-semibold text-[var(--ge-text-primary)]">Auditoría de plataforma</h3>
              <p className="text-sm text-[var(--ge-text-secondary)]">
                Código revisado, infraestructura monitoreada 24/7 y backups automáticos diarios.
              </p>
              <div className="grid w-full grid-cols-2 gap-3">
                {[
                  { icon: Lock, title: "HTTPS", sub: "HSTS preload" },
                  { icon: Database, title: "Backups", sub: "Diarios cifrados" },
                  { icon: UserCheck, title: "Privacidad", sub: "No vendemos data" },
                  { icon: CircleCheck, title: "AML/KYC", sub: "Cumplimiento" },
                ].map((b) => (
                  <div key={b.title} className="rounded-[var(--ge-radius-sm)] bg-[var(--ge-bg-elevated)] p-3">
                    <b.icon className="mx-auto mb-1 size-4 text-[var(--ge-cyan)]" />
                    <p className="text-xs font-semibold text-[var(--ge-text-primary)]">{b.title}</p>
                    <p className="text-[10px] text-[var(--ge-text-muted)]">{b.sub}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <FadeIn className="mb-10 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--ge-cyan)]">
                Preguntas frecuentes
              </span>
              <h2 className="mt-2 text-3xl font-bold text-[var(--ge-text-primary)]">
                Resolvemos tus <span className="ge-gradient-text">dudas</span>
              </h2>
            </FadeIn>
            <StaggerGroup className="flex flex-col gap-3">
              {FAQ.map((item) => (
                <MotionDiv key={item.q} variants={staggerItem}>
                  <details className="ge-card group p-4">
                    <summary className="cursor-pointer list-none font-medium text-[var(--ge-text-primary)]">
                      {item.q}
                    </summary>
                    <p className="mt-2 text-sm text-[var(--ge-text-secondary)]">{item.a}</p>
                  </details>
                </MotionDiv>
              ))}
            </StaggerGroup>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <FadeIn className="ge-card ge-scanlines mx-auto max-w-3xl p-10 text-center">
            <h2 className="text-3xl font-bold text-[var(--ge-text-primary)]">
              Empieza a operar <span className="ge-gradient-text">en minutos</span>
            </h2>
            <p className="mt-2 text-[var(--ge-text-secondary)]">
              Únete a más de 48,000 usuarios que ya manejan sus criptos con Transfer Efecty.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <MotionDiv whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/app/register"
                  className="inline-flex items-center gap-2 rounded-[var(--ge-radius)] px-6 py-3 font-medium text-[var(--ge-text-inverse)]"
                  style={{ background: "var(--ge-gradient-brand)" }}
                >
                  <Rocket className="size-4" /> Crear cuenta gratis
                </Link>
              </MotionDiv>
              <Link
                href="/app/login"
                className="rounded-[var(--ge-radius)] bg-[var(--ge-bg-elevated)] px-6 py-3 font-medium text-[var(--ge-text-primary)]"
              >
                Iniciar sesión
              </Link>
            </div>
          </FadeIn>
        </section>
        {/* Contacto */}
        <section id="contacto" className="px-6 pb-20">
          <FadeIn className="mx-auto max-w-xl text-center">
            <h2 className="mb-2 text-2xl font-bold text-[var(--ge-text-primary)]">
              ¿Tienes dudas? <span className="ge-gradient-text">Escríbenos</span>
            </h2>
            <p className="mb-6 text-sm text-[var(--ge-text-secondary)]">
              Te respondemos en menos de 24 horas.
            </p>
            <ContactForm />
          </FadeIn>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
