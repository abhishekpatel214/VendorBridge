"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  ShoppingCart, 
  Receipt, 
  Activity, 
  BarChart3,
  LogOut,
  User,
  UserCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const NAV_ITEMS = [
  { href: "/dashboard", translationKey: "nav.dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/vendors", translationKey: "nav.vendors", icon: Users, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER"] },
  { href: "/rfqs", translationKey: "nav.rfqs", icon: FileText, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/quotations", translationKey: "nav.quotations", icon: MessageSquare, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/approvals", translationKey: "nav.approvals", icon: CheckSquare, roles: ["ADMIN", "MANAGER"] },
  { href: "/purchase-orders", translationKey: "nav.purchaseOrders", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/invoices", translationKey: "nav.invoices", icon: Receipt, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/reports", translationKey: "nav.reports", icon: BarChart3, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER"] },
  { href: "/activity", translationKey: "nav.activity", icon: Activity, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER"] },
  { href: "/users", translationKey: "nav.users", icon: UserCog, roles: ["ADMIN"] },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside suppressHydrationWarning className="w-64 bg-slate-900 dark:bg-slate-950/80 dark:border-r dark:border-slate-800/50 text-slate-300 flex flex-col h-screen shrink-0 sticky top-0 overflow-y-auto hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 dark:border-slate-800/50">
        <span className="text-xl font-bold text-green-500">VendorBridge</span>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href) && item.href !== "/dashboard" || pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                isActive 
                  ? "bg-green-600 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
              {t(item.translationKey)}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link
          href="/profile"
          className={cn(
            "flex w-full items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            pathname.startsWith("/profile") ? "bg-green-600 text-white" : "hover:bg-slate-800 hover:text-white"
          )}
        >
          <User className={cn("mr-3 h-5 w-5", pathname.startsWith("/profile") ? "text-white" : "text-slate-400")} />
          {t("nav.profile")}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400" />
          {t("common.logout")}
        </button>
      </div>
    </aside>
  );
}
