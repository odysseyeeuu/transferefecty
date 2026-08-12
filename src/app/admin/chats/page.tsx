import type { Metadata } from "next";
import Link from "next/link";
import { requireRole } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { officeScopeId } from "@/lib/office-scope";

export const metadata: Metadata = { title: "Admin · Chats" };

export default async function AdminChatsPage() {
  const admin = await requireRole(["superadmin", "superworker"]);
  const scope = officeScopeId(admin);

  if (admin.role === "superworker" && scope <= 0) {
    return (
      <p className="ge-card px-4 py-3 text-sm text-[var(--ge-text-secondary)]">
        No tienes una oficina asignada.
      </p>
    );
  }

  const chats = await db.supportChat.findMany({
    where: scope > 0 ? { officeId: scope } : {},
    include: { user: { select: { fullName: true, email: true } } },
    orderBy: [{ status: "asc" }, { lastMessageAt: "desc" }],
    take: 80,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ge-text-primary)]">Chat en vivo</h1>
        <p className="mt-1 text-sm text-[var(--ge-text-secondary)]">{chats.length} chats.</p>
      </div>

      <div className="ge-card divide-y divide-[var(--ge-border)]">
        {chats.map((c) => (
          <Link
            key={c.id}
            href={`/admin/chat/${c.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-[var(--ge-bg-elevated)]"
          >
            <div>
              <p className="text-sm font-medium text-[var(--ge-text-primary)]">
                {c.user.fullName}
              </p>
              <p className="text-xs text-[var(--ge-text-muted)]">{c.user.email}</p>
            </div>
            <span className="text-xs font-medium text-[var(--ge-cyan)]">{c.status}</span>
          </Link>
        ))}
        {chats.length === 0 && (
          <p className="px-4 py-6 text-sm text-[var(--ge-text-secondary)]">Sin chats.</p>
        )}
      </div>
    </div>
  );
}
