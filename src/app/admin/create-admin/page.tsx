import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { CreateAdminForm } from "./create-admin-form";

export const metadata: Metadata = { title: "Admin · Crear administrador" };

export default async function CreateAdminPage() {
  await requireRole(["superadmin"]);
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Crear administrador</h1>
      <CreateAdminForm />
    </div>
  );
}
