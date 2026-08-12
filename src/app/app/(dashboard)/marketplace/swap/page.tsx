import { redirect } from "next/navigation";

// Puerto de `AppController::marketplaceSwap()` — en la v1 es un alias directo
// del mismo controlador que /app/swap.
export default function MarketplaceSwapPage() {
  redirect("/app/swap");
}
