"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  ShieldAlert,
  Building2,
  Award,
  MessageCircle,
  Settings,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: { count: number; variant: "danger" | "warning" };
}

interface NavSection {
  label: string;
  items: NavItem[];
}

  const getNavSections = (
  pendingOutlets: number,
  creditHoldShops: number
): NavSection[] => [{
    label: "Overview",
    items: [{ label: "Territory Map", href: "/sales", icon: LayoutDashboard }],
  },
  {
    label: "Team Management",
    items: [
      { label: "Booker Targets", href: "/sales/targets", icon: Target },
      { label: "PJP Route Builder", href: "/sales/pjp", icon: CalendarDays },
    ],
  },
  {
    label: "Credit & Outlets",
    items: [
      {
        label: "Credit Hold Management",
        href: "/sales/credit-holds",
        icon: ShieldAlert,
        badge: { count: creditHoldShops, variant: "danger" },
      },
      {
        label: "New Outlet Approval",
        href: "/sales/outlets/pending",
        icon: Building2,
        badge: { count: pendingOutlets, variant: "warning" },
      },
    ],
  },
  {
    label: "Sales Tools",
    items: [
      { label: "Scheme Management", href: "/sales/schemes", icon: Award },
      { label: "Broadcast Messaging", href: "/sales/broadcast", icon: MessageCircle },
    ],
  },
];

interface SidebarProps {
  tenantName?: string;
  pendingOutlets: number;
  creditHoldShops: number;
}



export function Sidebar({
  tenantName = "Hafeez Brothers Distributors",
  pendingOutlets,creditHoldShops,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-[200] flex w-[250px] flex-col overflow-hidden bg-secondary">
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.08] px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
          <LayoutDashboard className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
        </div>
        <span className="font-display text-xl font-bold text-white">DistributeOS</span>
      </div>

      <div className="mx-3 mt-3 rounded-md bg-white/[0.06] px-3 py-2">
        <div className="text-sm font-semibold text-[#5B9BFF]">Sales Manager</div>
        <div className="mt-0.5 text-xs text-secondary-text">{tenantName}</div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 [scrollbar-width:none]">
{getNavSections(
  pendingOutlets,
  creditHoldShops
).map((section) => (          <div key={section.label}>
            <div className="px-4 pb-2 pt-4 text-[10px] font-medium uppercase tracking-[0.1em] text-secondary-text">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "mx-2 my-px flex h-11 items-center gap-3 whitespace-nowrap rounded-md px-4 text-md font-medium transition-colors",
                    active
                      ? "bg-primary text-white"
                      : "text-text-sidebar hover:bg-secondary-mid hover:text-white"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
                  {item.label}
                  {item.badge && (
                    <span
                      className={cn(
                        "ml-auto flex h-[18px] items-center rounded-full px-1.5 text-[10px] font-semibold",
                        item.badge.variant === "danger"
                          ? "bg-danger-subtle text-danger"
                          : "bg-warning-subtle text-warning"
                      )}
                    >
                      {item.badge.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-white/[0.08] py-3">
        <div className="mx-2 my-px flex h-11 cursor-pointer items-center gap-3 rounded-md px-4 text-md font-medium text-text-sidebar hover:bg-secondary-mid hover:text-white">
          <Settings className="h-[18px] w-[18px]" strokeWidth={2} />
          Settings
        </div>
        <div className="mx-2 my-px flex h-11 cursor-pointer items-center gap-3 rounded-md px-4 text-md font-medium text-text-sidebar hover:bg-secondary-mid hover:text-white">
          <HelpCircle className="h-[18px] w-[18px]" strokeWidth={2} />
          Help
        </div>
      </div>
    </aside>
  );
}