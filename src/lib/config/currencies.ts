// Puerto 1:1 de `www/config/config.php` (clave `crypto.currencies`).

export interface CurrencyConfig {
  code: string;
  name: string;
  icon: string;
  color: string;
}

export const CRYPTO_CURRENCIES: CurrencyConfig[] = [
  { code: "BTC", name: "Bitcoin", icon: "btc", color: "#F7931A" },
  { code: "ETH", name: "Ethereum", icon: "eth", color: "#627EEA" },
  { code: "USDT", name: "Tether", icon: "usdt", color: "#26A17B" },
  { code: "USDC", name: "USD Coin", icon: "usdc", color: "#2775CA" },
  { code: "BNB", name: "BNB", icon: "bnb", color: "#F3BA2F" },
  { code: "XRP", name: "XRP", icon: "xrp", color: "#23292F" },
  { code: "SOL", name: "Solana", icon: "sol", color: "#9945FF" },
  { code: "TRX", name: "TRON", icon: "trx", color: "#FF0013" },
  { code: "DOGE", name: "Dogecoin", icon: "doge", color: "#C2A633" },
];

export const WITHDRAW_CURRENCIES = CRYPTO_CURRENCIES.map((c) => c.code);

/** Redes válidas por moneda para depósito/retiro. Puerto de `config.php` (`crypto.networks`). */
export const NETWORKS_BY_CURRENCY: Record<string, string[]> = {
  BTC: ["Bitcoin"],
  ETH: ["ERC20", "Arbitrum", "Optimism", "Base"],
  USDT: ["TRC20", "ERC20", "BEP20", "Polygon", "Solana"],
  USDC: ["ERC20", "TRC20", "BEP20", "Polygon", "Solana"],
  BNB: ["BEP20"],
  XRP: ["XRP Ledger"],
  SOL: ["Solana"],
  TRX: ["TRC20"],
  DOGE: ["Dogecoin"],
};

export function isValidPaymentNetwork(currency: string, network: string): boolean {
  const allowed = NETWORKS_BY_CURRENCY[currency.toUpperCase()] ?? ["ERC20", "TRC20", "BEP20"];
  return allowed.map((n) => n.toUpperCase()).includes(network.toUpperCase());
}
