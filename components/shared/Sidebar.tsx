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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/vendors", label: "Vendors", icon: Users, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER"] },
  { href: "/rfqs", label: "RFQs", icon: FileText, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/quotations", label: "Quotations", icon: MessageSquare, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/approvals", label: "Approvals", icon: CheckSquare, roles: ["ADMIN", "MANAGER"] },
  { href: "/purchase-orders", label: "Purchase Orders", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/invoices", label: "Invoices", icon: Receipt, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER", "VENDOR"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER"] },
  { href: "/activity", label: "Activity Logs", icon: Activity, roles: ["ADMIN", "MANAGER", "PROCUREMENT_OFFICER"] },
];

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen shrink-0 sticky top-0 overflow-y-auto hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold text-green-500">VendorBridge</span>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-slate-400" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
