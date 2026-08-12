import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { CreateWorkerForm } from "./create-worker-form";

export const metadata: Metadata = { title: "Admin · Crear SuperWorker" };

export default async function CreateWorkerPage() {
  await requireRole(["superadmin"]);
  const offices = await db.office.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Crear SuperWorker</h1>
      <CreateWorkerForm offices={offices} />
    </div>
  );
}
