import { PjpGrid } from "@/components/sales/pjp-grid";
import { PjpAdherenceTable } from "@/components/sales/pjp-adherence-table";
import { getPjpAssignments, getPjpAdherence } from "@/lib/api/sales";

export default async function PjpPage() {
  const [assignments, adherence] = await Promise.all([getPjpAssignments(), getPjpAdherence()]);

  return (
    <div>
      <PjpGrid initialAssignments={assignments} />
      <PjpAdherenceTable rows={adherence} />
    </div>
  );
}
