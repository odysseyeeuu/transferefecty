import "server-only";
import { db } from "@/lib/db";

/**
 * Código de registro rotativo por oficina (3 letras + 3 números, ej. CTR482).
 * Cambia a las 00:00 hora Colombia. Puerto 1:1 de
 * `www/src/Services/OfficeCodeService.php`.
 */

const TIMEZONE = "America/Bogota";

export function todayInBogota(): string {
  // en-CA da formato YYYY-MM-DD directamente.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

function randomCode(usedToday: Set<string>): string {
  for (let attempt = 0; attempt < 80; attempt++) {
    let letters = "";
    for (let i = 0; i < 3; i++) {
      letters += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }
    const numbers = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    const candidate = `${letters}${numbers}`;
    if (!usedToday.has(candidate)) return candidate;
  }
  let fallback: string;
  do {
    fallback = `GEF${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;
  } while (usedToday.has(fallback));
  return fallback;
}

export async function ensureFreshOfficeCodes(): Promise<void> {
  const today = todayInBogota();
  const offices = await db.office.findMany({
    where: { isActive: true },
    select: { id: true, code: true, codeDate: true },
  });

  const usedToday = new Set<string>();
  const staleIds: number[] = [];

  for (const office of offices) {
    const code = office.code ?? "";
    const isNewFormat = /^[A-Z]{3}[0-9]{3}$/.test(code);
    const codeDateStr = office.codeDate
      ? new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(office.codeDate)
      : "";
    const isFresh = codeDateStr === today && code !== "" && isNewFormat;
    if (isFresh) {
      usedToday.add(code);
    } else {
      staleIds.push(office.id);
    }
  }

  for (const officeId of staleIds) {
    const code = randomCode(usedToday);
    usedToday.add(code);
    await db.office.update({
      where: { id: officeId },
      data: { code, codeDate: new Date(today) },
    });
  }
}

export function normalizeOfficeCodeInput(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function findActiveOfficeByCode(rawCode: string) {
  const code = normalizeOfficeCodeInput(rawCode);
  if (!/^[A-Z]{3}[0-9]{3}$/.test(code)) return null;

  await ensureFreshOfficeCodes();
  const today = todayInBogota();

  return db.office.findFirst({
    where: { code, isActive: true, codeDate: new Date(today) },
    select: { id: true, name: true, code: true },
  });
}
