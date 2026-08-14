"use client";

import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react";

interface Coin {
  code: string;
  name: string;
  amount: string;
  change: number;
  color: string;
}

/** Tarjeta de billetera flotante — el "producto" visible en el hero. */
export function HeroVisual({ coins }: { coins: Coin[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-sm"
      style={{ perspective: 1200 }}
    >
      {/* Flotación continua, muy sutil */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="ge-card relative overflow-hidden p-5"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-20 blur-2xl"
          style={{ background: "var(--ge-gradient-brand)" }}
        />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs text-[var(--ge-text-muted)]">Balance total</p>
            <AnimatedBalance value={18742.65} />
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[var(--ge-success)]">
              <TrendingUp className="size-3.5" /> +12,4% esta semana
            </p>
          </div>
          <div className="flex gap-2">
            <span className="flex size-9 items-center justify-center rounded-full bg-[var(--ge-bg-elevated)] text-[var(--ge-violet)]">
              <ArrowUpRight className="size-4" />
            </span>
            <span className="flex size-9 items-center justify-center rounded-full bg-[var(--ge-bg-elevated)] text-[var(--ge-cyan)]">
              <ArrowDownLeft className="size-4" />
            </span>
          </div>
        </div>

        <div className="relative mt-5 flex flex-col gap-1">
          {coins.map((c, i) => (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.4 + i * 0.09 }}
              className="flex items-center gap-3 rounded-[var(--ge-radius-sm)] px-2 py-2 transition-colors hover:bg-[var(--ge-bg-secondary)]"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ background: c.color }}
              >
                {c.code}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[var(--ge-text-primary)]">
                  {c.name}
                </p>
                <p className="text-xs text-[var(--ge-text-muted)]">{c.code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[var(--ge-text-primary)]">{c.amount}</p>
                <p
                  className="text-xs font-medium"
                  style={{ color: c.change >= 0 ? "var(--ge-success)" : "var(--ge-error)" }}
                >
                  {c.change >= 0 ? "+" : ""}
                  {c.change.toFixed(1)}%
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Píldoras flotantes: sobre los bordes superior/inferior, nunca
          encima del contenido de la tarjeta. */}
      <FloatingPill className="-top-3 left-6" delay={0.9} label="Swap 0,1%" />
      <FloatingPill className="-bottom-3 right-6" delay={1.15} label="CDT hasta 12,5%" />
    </motion.div>
  );
}

function FloatingPill({
  label,
  className = "",
  delay = 0,
}: {
  label: string;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, y: [0, -7, 0] }}
      transition={{
        opacity: { duration: 0.4, delay },
        scale: { duration: 0.4, delay },
        y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay },
      }}
      className={`ge-card absolute hidden whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-[var(--ge-text-primary)] sm:block ${className}`}
    >
      {label}
    </motion.span>
  );
}

/** Contador que sube al entrar en pantalla. */
function AnimatedBalance({ value }: { value: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1400, bounce: 0 });
  const text = useTransform(spring, (v) =>
    `$${v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  );

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, mv, value]);

  return (
    <p ref={ref} className="text-3xl font-bold text-[var(--ge-text-primary)]">
      <motion.span>{text}</motion.span>
    </p>
  );
}
