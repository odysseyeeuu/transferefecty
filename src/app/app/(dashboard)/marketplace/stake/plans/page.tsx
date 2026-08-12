import { redirect } from "next/navigation";

// Puerto de `AppController::marketplaceStake()` — alias directo de /app/stake.
export default function MarketplaceStakePlansPage() {
  redirect("/app/stake");
}
