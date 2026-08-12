"use server";

import { db } from "@/lib/db";

// Puerto de `LandingController::contact()`.
export type ContactState = { message?: string; success?: boolean } | undefined;

export async function submitContactMessage(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { message: "Todos los campos son requeridos." };
  }

  await db.contactMessage.create({ data: { name, email, message } });

  return { success: true };
}
