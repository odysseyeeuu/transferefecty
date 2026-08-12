import "server-only";
import { db } from "@/lib/db";

// Puerto de `SettingsService.php` — lectura simple de `platform_settings`.
export async function getSetting(key: string, fallback: string): Promise<string> {
  const row = await db.platformSetting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function getSettings(
  keys: Record<string, string>
): Promise<Record<string, string>> {
  const rows = await db.platformSetting.findMany({ where: { key: { in: Object.keys(keys) } } });
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const result: Record<string, string> = {};
  for (const [key, fallback] of Object.entries(keys)) {
    result[key] = map.get(key) ?? fallback;
  }
  return result;
}
