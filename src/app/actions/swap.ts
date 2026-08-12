"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { adjustBalance, ensureWallet, getBalance, recordTransaction } from "@/lib/wallet";
import { notifyUser } from "@/lib/notifications";
import { getPrices, convertWithPrices } from "@/lib/market";
import { getSetting } from "@/lib/settings";
import { CRYPTO_CURRENCIES } from "@/lib/config/currencies";

/**
 * Puerto de `AppController::swapExecute()`. Sólo el flujo instantáneo (el
 * flujo alterno de swaps "pendientes de aprobación admin" de la v1 no se
 * portó — ver docs/PARIDAD.md).
 */

export type SwapState = { message?: string } | undefined;

export async function executeSwap(
  _prevState: SwapState,
  formData: FormData
): Promise<SwapState> {
  const user = await requireUser();
  if (!user.allowSwap) {
    return { message: "Los intercambios están deshabilitados para tu cuenta." };
  }

  const from = String(formData.get("fromCurrency") ?? "").toUpperCase();
  const to = String(formData.get("toCurrency") ?? "").toUpperCase();
  const amount = Number(formData.get("amount"));

  const codes = CRYPTO_CURRENCIES.map((c) => c.code);
  if (from === to || !codes.includes(from) || !codes.includes(to) || !(amount > 0)) {
    return { message: "Par de monedas o monto inválido." };
  }

  const available = await getBalance(user.id, from);
  if (available + 1e-12 < amount) {
    return { message: "Saldo insuficiente en la moneda de origen." };
  }

  const feePercent = Number(await getSetting("swap_fee_percent", "0.1"));
  const fee = amount * (feePercent / 100);
  const net = amount - fee;

  const prices = await getPrices();
  const toAmount = convertWithPrices(prices, from, to, net);
  const rate = convertWithPrices(prices, from, to, 1);
  if (toAmount <= 0 || rate <= 0) {
    return { message: "No hay tasa de mercado disponible. Intenta más tarde." };
  }

  try {
    await db.$transaction(async (tx) => {
      await ensureWallet(tx, user.id, from);
      await ensureWallet(tx, user.id, to);

      const debited = await adjustBalance(tx, user.id, from, -amount);
      if (!debited) throw new Error("balance");
      const credited = await adjustBalance(tx, user.id, to, toAmount);
      if (!credited) throw new Error("credit");

      await tx.swap.create({
        data: {
          userId: user.id,
          fromCurrency: from,
          toCurrency: to,
          fromAmount: amount,
          toAmount,
          feePercent,
          feeAmount: fee,
          rate,
          status: "completed",
        },
      });

      await recordTransaction(tx, {
        userId: user.id,
        type: "swap",
        currency: from,
        amount,
        status: "completed",
        description: `Swap ${from} → ${to} (recibes ${toAmount.toFixed(8)} ${to})`,
        fee,
      });
    });
  } catch {
    return { message: "No se pudo completar el intercambio. Verifica tu saldo e intenta de nuevo." };
  }

  await notifyUser(
    user.id,
    "Intercambio completado",
    `Cambiaste ${amount} ${from} por ${toAmount.toFixed(8)} ${to}. Comisión: ${fee.toFixed(8)} ${from}.`,
    "success"
  );

  revalidatePath("/app/swap");
  revalidatePath("/app/dashboard");
  redirect("/app/swap?success=1");
}
