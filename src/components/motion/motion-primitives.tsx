"use client";

import { motion } from "framer-motion";

/**
 * Re-exports tipados de `motion.*` para usar dentro de Server Components
 * (que no pueden importar `framer-motion` directamente sin volverse
 * Client Components) — este archivo sí es "use client", así que sirve de
 * puente.
 */
export const MotionDiv = motion.div;
export const MotionSpan = motion.span;
export const MotionH1 = motion.h1;
