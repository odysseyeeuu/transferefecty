"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser, requireRole } from "@/lib/auth/dal";
import { getPrices } from "@/lib/market";
import { getSettings } from "@/lib/settings";
import { adjustBalance, ensureWallet, recordTransaction } from "@/lib/wallet";
import { notifyUser } from "@/lib/notifications";
import { logAdminAction } from "@/lib/admin-log";
import { CRYPTO_CURRENCIES, isValidPaymentNetwork } from "@/lib/config/currencies";

/**
 * Puerto de `AppController::depositRequest()/withdrawalRequest()` y
 * `AdminController::reviewPayment()` (aprobar/rechazar).
 *
 * Simplificación deliberada frente a la v1 (documentada en docs/PARIDAD.md):
 * sólo canal **crypto** por ahora — retiro por banco/tarjeta con métodos de
 * pago guardados queda pendiente de portar.
 */

export type PaymentActionState = { message?: string } | undefined;

export async function requestDeposit(
  _prevState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const user = await requireUser();
  if (!user.allowBuy) return { message: "No tienes permiso para depositar." };

  const currency = String(formData.get("currency") ?? "").toUpperCase();
  const network = String(formData.get("network") ?? "").toUpperCase().trim();
  const amount = Number(formData.get("amount"));
  const notes = String(formData.get("notes") ?? "").trim();

  if (!CRYPTO_CURRENCIES.some((c) => c.code === currency)) {
    return { message: "Moneda no soportada." };
  }
  if (!isValidPaymentNetwork(currency, network)) {
    return { message: "Red inválida para esta moneda." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { message: "Ingresa un monto válido." };
  }

  const prices = await getPrices();
  const { min_deposit_usd } = await getSettings({ min_deposit_usd: "10" });
  const usdValue = amount * (prices[currency] ?? (currency === "USDT" ? 1 : 0));
  if (usdValue < Number(min_deposit_usd)) {
    return { message: `El depósito mínimo es de ~$${min_deposit_usd} USD.` };
  }

  await db.depositRequest.create({
    data: {
      userId: user.id,
      type: "deposit",
      currency,
      amount,
      destinationChannel: "crypto",
      notes: notes ? `${notes} [red: ${network}]` : `[red: ${network}]`,
    },
  });

  revalidatePath("/app/payments");
  redirect("/app/payments?deposit=1");
}

export async function requestWithdrawal(
  _prevState: PaymentActionState,
  formData: FormData
): Promise<PaymentActionState> {
  const user = await requireUser();
  if (!user.allowSell) return { message: "No tienes permiso para retirar." };

  const currency = String(formData.get("currency") ?? "").toUpperCase();
  const network = String(formData.get("network") ?? "").toUpperCase().trim();
  const amount = Number(formData.get("amount"));
  const address = String(formData.get("address") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!CRYPTO_CURRENCIES.some((c) => c.code === currency)) {
    return { message: "Moneda no soportada." };
  }
  if (!isValidPaymentNetwork(currency, network) || !address) {
    return { message: "Completa la red y la dirección de destino." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { message: "Ingresa un monto válido." };
  }

  const prices = await getPrices();
  const { min_withdrawal_usd } = await getSettings({ min_withdrawal_usd: "20" });
  const usdValue = amount * (prices[currency] ?? (currency === "USDT" ? 1 : 0));
  if (usdValue < Number(min_withdrawal_usd)) {
    return { message: `El retiro mínimo es de ~$${min_withdrawal_usd} USD.` };
  }

  try {
    await db.$transaction(async (tx) => {
      const ok = await adjustBalance(tx, user.id, currency, -amount);
      if (!ok) throw new Error("insufficient_balance");

      await tx.depositRequest.create({
        data: {
          userId: user.id,
          type: "withdrawal",
          currency,
          amount,
          destinationAddress: address,
          destinationChannel: "crypto",
          destinationDetails: { currency, network, address },
          notes: notes ? `${notes} [red: ${network}]` : `[red: ${network}]`,
        },
      });

      await recordTransaction(tx, {
        userId: user.id,
        type: "withdrawal",
        currency,
        amount,
        status: "pending",
        description: `Retiro solicitado por red ${network} — pendiente de aprobación`,
      });
    });
  } catch {
    return { message: "Saldo insuficiente para este retiro." };
  }

  revalidatePath("/app/payments");
  revalidatePath("/app/dashboard");
  redirect("/app/payments?withdraw=1");
}

export type ReviewPaymentState = { message?: string } | undefined;

/**
 * Aprobar/rechazar un `deposit_requests` (deposito o retiro). Versión
 * simplificada frente a la v1: no incluye "revertir aprobación" ni "editar
 * monto antes de aprobar" — ver docs/PARIDAD.md.
 */
export async function reviewPaymentRequest(
  _prevState: ReviewPaymentState,
  formData: FormData
): Promise<ReviewPaymentState> {
  const admin = await requireRole(["superadmin", "superworker"]);
  const id = Number(formData.get("requestId"));
  const decision = String(formData.get("decision") ?? "");
  const staffNote = String(formData.get("staffNote") ?? "").trim();

  if (!id || !["approved", "rejected"].includes(decision)) {
    return { message: "Solicitud inválida." };
  }

  const request = await db.depositRequest.findUnique({ where: { id } });
  if (!request || request.status !== "pending") {
    return { message: "La solicitud ya fue procesada." };
  }

  const amount = Number(request.amount);

  await db.$transaction(async (tx) => {
    if (decision === "approved") {
      if (request.type === "deposit") {
        await ensureWallet(tx, request.userId, request.currency);
        await adjustBalance(tx, request.userId, request.currency, amount);
        await recordTransaction(tx, {
          userId: request.userId,
          type: "deposit",
          currency: request.currency,
          amount,
          status: "completed",
          description: "Depósito aprobado por admin",
          adminId: admin.id,
        });
        await notifyUser(
          request.userId,
          "Depósito aprobado",
          `Se acreditaron ${amount} ${request.currency} en tu wallet.${staffNote ? ` Nota: ${staffNote}` : ""}`,
          "success"
        );
      } else {
        // El saldo ya se retuvo al crear la solicitud — sólo marcar la transacción pendiente como completada.
        await tx.transaction.updateMany({
          where: {
            userId: request.userId,
            type: "withdrawal",
            status: "pending",
            currency: request.currency,
            amount,
          },
          data: { status: "completed", description: "Retiro aprobado y procesado" },
        });
        await notifyUser(
          request.userId,
          "Retiro aprobado",
          `Tu retiro de ${amount} ${request.currency} fue procesado.${staffNote ? ` Nota: ${staffNote}` : ""}`,
          "success"
        );
      }
    } else {
      if (request.type === "withdrawal") {
        // Devolver el saldo retenido.
        await ensureWallet(tx, request.userId, request.currency);
        await adjustBalance(tx, request.userId, request.currency, amount);
        await tx.transaction.updateMany({
          where: {
            userId: request.userId,
            type: "withdrawal",
            status: "pending",
            currency: request.currency,
            amount,
          },
          data: {
            status: "cancelled",
            description: `Rechazado por el área de desembolsos${staffNote ? `: ${staffNote}` : ""}`,
          },
        });
        await notifyUser(
          request.userId,
          "Retiro rechazado",
          `Tu retiro fue rechazado por el área de desembolsos. El saldo fue devuelto a tu wallet.${
            staffNote ? ` Motivo: ${staffNote}` : ""
          }`,
          "warning"
        );
      } else {
        await notifyUser(
          request.userId,
          "Depósito rechazado",
          `Tu solicitud de depósito no fue aprobada. Contacta soporte si tienes dudas.${
            staffNote ? ` Motivo: ${staffNote}` : ""
          }`,
          "warning"
        );
      }
    }

    await tx.depositRequest.update({
      where: { id },
      data: {
        status: decision as "approved" | "rejected",
        reviewedBy: admin.id,
        notes: staffNote
          ? `${request.notes ?? ""}${request.notes ? " | " : ""}Nota staff: ${staffNote}`
          : request.notes,
      },
    });

    if (staffNote) {
      await tx.user.update({ where: { id: request.userId }, data: { dashboardNote: staffNote } });
    }
  });

  await logAdminAction(admin.id, `payment_${decision}`, "deposit_request", id);

  revalidatePath("/admin/payments");
  redirect("/admin/payments?reviewed=1");
}

/** Wrapper para usar directamente como `action` de un `<form>` sin `useActionState`. */
export async function reviewPaymentRequestForm(formData: FormData) {
  await reviewPaymentRequest(undefined, formData);
}
