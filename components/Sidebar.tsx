"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Grid3x3, PieChart, LogOut } from "lucide-react";

const NAV = [
  { href: "overview",   label: "Overview",   Icon: LayoutDashboard },
  { href: "athletes",   label: "Athletes",   Icon: Users },
  { href: "top-posts",  label: "Top Posts",  Icon: Grid3x3 },
  { href: "audience",   label: "Audience",   Icon: PieChart },
];

interface Props {
  brandId: string;
  brandName: string;
}

export default function Sidebar({ brandId, brandName }: Props) {
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-sidebar flex flex-col z-30">
      {/* Brand header */}
      <div className="px-6 pt-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-display font-semibold">P</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">Padelity</p>
            <p className="text-white/40 text-xs leading-tight">Analytics Portal</p>
          </div>
        </div>
      </div>

      {/* Active brand */}
      <div className="px-6 py-4 border-b border-white/10">
        <p className="text-white/40 text-[10px] uppercase tracking-[0.12em] mb-1">
          Brand
        </p>
        <p className="text-white text-sm font-medium">{brandName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, Icon }) => {
          const isActive = pathname === `/${brandId}/${href}`;
          return (
            <Link
              key={href}
              href={`/${brandId}/${href}`}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                ${
                  isActive
                    ? "bg-white text-sidebar font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/8"
                }
              `}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-colors"
        >
          <LogOut size={16} strokeWidth={2} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
