import "server-only";

/**
 * Puerto simplificado de `MarketService.php`. La v1 cacheaba en un archivo
 * JSON en disco con TTL de 120s; aquí usamos la Data Cache nativa de
 * Next.js (`fetch(..., { next: { revalidate } })`), que en Vercel además
 * se comparte entre invocaciones — no hace falta reinventar el cacheo.
 */

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  USDC: "usd-coin",
  BNB: "binancecoin",
  XRP: "ripple",
  SOL: "solana",
  TRX: "tron",
  DOGE: "dogecoin",
};

// Precios de respaldo si CoinGecko falla o no hay salida a internet
// (ej. build sandbox). Nunca usar esto para lógica financiera real en prod
// sin que el fetch real haya fallado.
const FALLBACK_PRICES: Record<string, number> = {
  BTC: 60000,
  ETH: 3000,
  USDT: 1,
  USDC: 1,
  BNB: 550,
  XRP: 0.6,
  SOL: 140,
  TRX: 0.12,
  DOGE: 0.15,
};

export interface MarketRow {
  code: string;
  price: number;
  change24h: number;
}

export async function getMarketData(): Promise<MarketRow[]> {
  const ids = Object.values(COINGECKO_IDS).join(",");
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}`,
      { next: { revalidate: 120 } }
    );
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const rows = (await res.json()) as Array<{
      id: string;
      current_price: number;
      price_change_percentage_24h: number | null;
    }>;

    const byId = new Map(rows.map((r) => [r.id, r]));
    return Object.entries(COINGECKO_IDS).map(([code, id]) => {
      const row = byId.get(id);
      return {
        code,
        price: row?.current_price ?? FALLBACK_PRICES[code],
        change24h: row?.price_change_percentage_24h ?? 0,
      };
    });
  } catch {
    return Object.entries(FALLBACK_PRICES).map(([code, price]) => ({
      code,
      price,
      change24h: 0,
    }));
  }
}

export async function getPrices(): Promise<Record<string, number>> {
  const data = await getMarketData();
  return Object.fromEntries(data.map((row) => [row.code, row.price]));
}

/** Convierte `amount` de `from` a `to` usando precios USD. Puerto de `MarketService::convert()`. */
export function convertWithPrices(
  prices: Record<string, number>,
  from: string,
  to: string,
  amount: number
): number {
  if (amount <= 0) return 0;
  if (from === to) return amount;

  let fromPrice = prices[from] ?? 0;
  let toPrice = prices[to] ?? 0;
  if (["USDT", "USDC"].includes(from) && fromPrice <= 0) fromPrice = 1;
  if (["USDT", "USDC"].includes(to) && toPrice <= 0) toPrice = 1;
  if (fromPrice <= 0 || toPrice <= 0) return 0;

  return (amount * fromPrice) / toPrice;
}
