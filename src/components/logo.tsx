import Image from "next/image";
import Link from "next/link";

/**
 * Logo de marca. Dos variantes:
 *  - `full`: isotipo + wordmark ("TRANSFER EFECTY / CRYPTO WALLET").
 *    Relación 420x112. Usar de 32px de alto para arriba; por debajo el
 *    wordmark deja de leerse.
 *  - `mark`: solo el isotipo (billetera). Relación 128x96. Para espacios
 *    reducidos y avatares.
 *
 * Son SVG, así que escalan sin pérdida y pesan ~2KB — a diferencia de los
 * PNG de marca del proyecto viejo, que rondaban 1MB.
 */

const RATIO = {
  full: 420 / 112,
  mark: 128 / 96,
} as const;

interface LogoProps {
  variant?: "full" | "mark";
  /** Alto en px; el ancho se calcula por la relación de aspecto. */
  height?: number;
  className?: string;
  priority?: boolean;
}

export function Logo({ variant = "full", height = 40, className, priority }: LogoProps) {
  const src = variant === "full" ? "/brand/logo-horizontal.svg" : "/brand/isotipo.svg";
  return (
    <Image
      src={src}
      alt="Transfer Efecty"
      width={Math.round(height * RATIO[variant])}
      height={height}
      className={className}
      priority={priority}
    />
  );
}

/** Logo enlazado, para cabeceras y barras laterales. */
export function LogoLink({
  href = "/",
  variant = "full",
  height = 40,
  className,
  priority,
}: LogoProps & { href?: string }) {
  return (
    <Link href={href} aria-label="Transfer Efecty — inicio" className={className}>
      <Logo variant={variant} height={height} priority={priority} />
    </Link>
  );
}
