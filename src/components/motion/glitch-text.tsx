"use client";

import { motion } from "framer-motion";

/**
 * Wordmark/titular con efecto glitch (RGB split en hover/focus, definido en
 * `.ge-glitch` dentro de globals.css) + una entrada sutil con framer-motion.
 * Pensado para el logo y titulares de landing — no para párrafos largos.
 */
interface GlitchTextProps {
  text: string;
  as?: "span" | "h1" | "h2";
  gradient?: boolean;
  className?: string;
}

const TAGS = {
  span: motion.span,
  h1: motion.h1,
  h2: motion.h2,
} as const;

export function GlitchText({ text, as = "span", gradient = true, className = "" }: GlitchTextProps) {
  const MotionTag = TAGS[as];

  return (
    <MotionTag
      className={`ge-glitch ${gradient ? "ge-gradient-text" : ""} ${className}`}
      data-text={text}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      tabIndex={0}
    >
      {text}
    </MotionTag>
  );
}
