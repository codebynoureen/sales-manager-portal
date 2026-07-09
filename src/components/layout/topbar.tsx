"use client";

import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";

const SCREEN_META: Record<string, { title: string; breadcrumb: string }> = {
  "/sales": { title: "Territory Map Dashboard", breadcrumb: "Sales Manager → Overview → Territory Map" },
  "/sales/targets": { title: "Booker Target Management", breadcrumb: "Sales Manager → Team → Targets" },
  "/sales/pjp": { title: "PJP Route Builder", breadcrumb: "Sales Manager → Team → PJP Builder" },
  "/sales/credit-holds": { title: "Credit Hold Management", breadcrumb: "Sales Manager → Credit & Outlets → Holds" },
  "/sales/outlets/pending": { title: "New Outlet Approval", breadcrumb: "Sales Manager → Credit & Outlets → Approvals" },
  "/sales/schemes": { title: "Scheme Management", breadcrumb: "Sales Manager → Sales Tools → Schemes" },
  "/sales/broadcast": { title: "Broadcast Messaging", breadcrumb: "Sales Manager → Sales Tools → Broadcast" },
};

export function Topbar({ userName = "Farhan Yousuf", userInitials = "FY" }: { userName?: string; userInitials?: string }) {
  const pathname = usePathname();
  const meta = SCREEN_META[pathname] ?? { title: "Sales Manager", breadcrumb: "Sales Manager" };

  return (
    <header className="fixed left-[250px] right-0 top-0 z-[100] flex h-16 items-center gap-4 border-b border-border bg-surface px-6 shadow-[0_1px_3px_rgba(15,23,42,0.06)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-primary">
      <div className="flex-1">
        <h1 className="font-display text-xl font-bold leading-tight text-text">{meta.title}</h1>
        <div className="mt-px text-sm text-text-muted">{meta.breadcrumb}</div>
      </div>

      <div className="flex items-center gap-2">
        <button className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface3 hover:text-text">
          <Search className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface3 hover:text-text">
          <Bell className="h-[18px] w-[18px]" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-surface bg-danger" />
        </button>
        <div className="mx-2 h-6 w-px bg-border" />
        <div className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-surface3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-subtle text-sm font-semibold text-primary">
            {userInitials}
          </div>
          <span className="text-base font-medium text-text">{userName}</span>
        </div>
      </div>
    </header>
  );
}