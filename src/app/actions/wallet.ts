"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/dal";
import { adjustBalance, recordTransaction } from "@/lib/wallet";

// Puerto de `AppController::walletSend()`. Igual que la v1: registra un
// envío externo (debita saldo + deja constancia en `transactions`), no es
// una transferencia interna entre usuarios de la plataforma.

export type WalletSendState = { message?: string } | undefined;

export async function sendCrypto(
  _prevState: WalletSendState,
  formData: FormData
): Promise<WalletSendState> {
  const user = await requireUser();
  if (!user.allowSend) return { message: "No tienes permiso para enviar." };

  const currency = String(formData.get("currency") ?? "").toUpperCase();
  const amount = Number(formData.get("amount"));
  const address = String(formData.get("address") ?? "").trim();

  if (!currency || !(amount > 0) || !address) {
    return { message: "Completa moneda, monto y dirección." };
  }

  try {
    await db.$transaction(async (tx) => {
      const ok = await adjustBalance(tx, user.id, currency, -amount);
      if (!ok) throw new Error("balance");
      await recordTransaction(tx, {
        userId: user.id,
        type: "send",
        currency,
        amount,
        status: "completed",
        description: `Envío a ${address.slice(0, 20)}...`,
      });
    });
  } catch {
    return { message: "Saldo insuficiente." };
  }

  revalidatePath("/app/transactions");
  revalidatePath("/app/dashboard");
  redirect("/app/transactions?sent=1");
}
