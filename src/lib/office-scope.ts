// Puerto de `AdminController::officeScopeId()` / `canAccessUserByOffice()`.
// Un SuperWorker sólo ve/gestiona su propia oficina; un SuperAdmin ve todas
// (representado como `officeScopeId = 0`, "sin filtro").

export interface StaffLike {
  role: string;
  officeId: number | null;
}

export function officeScopeId(staff: StaffLike): number {
  if (staff.role !== "superworker") return 0;
  return staff.officeId ?? 0;
}

export function canAccessOffice(staff: StaffLike, targetOfficeId: number | null): boolean {
  const scope = officeScopeId(staff);
  if (staff.role === "superworker" && scope <= 0) return false;
  if (scope <= 0) return true;
  return targetOfficeId === scope;
}
