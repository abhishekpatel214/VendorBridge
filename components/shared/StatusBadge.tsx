import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 
  | "PENDING" | "ACTIVE" | "INACTIVE" // Vendor
  | "DRAFT" | "OPEN" | "CLOSED" | "AWARDED" // RFQ
  | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" // Quotation / Approval
  | "CONFIRMED" | "INVOICED" | "SENT" | "PAID"; // PO / Invoice

const statusStyles: Record<StatusType, string> = {
  // Vendor
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20",
  INACTIVE: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20",
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20",
  
  // RFQ
  DRAFT: "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400 border-slate-200 dark:border-slate-500/20",
  OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  CLOSED: "bg-slate-200 text-slate-800 dark:bg-slate-500/20 dark:text-slate-300 border-slate-300 dark:border-slate-500/30",
  AWARDED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
  
  // Quotation / Approval
  SUBMITTED: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  UNDER_REVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20",
  ACCEPTED: "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20",

  // PO / Invoice
  CONFIRMED: "bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400 border-green-200 dark:border-green-500/20",
  INVOICED: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  SENT: "bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = statusStyles[status as StatusType] || "bg-slate-100 text-slate-800 dark:bg-slate-500/10 dark:text-slate-400";
  
  return (
    <Badge variant="outline" className={cn("font-medium", style, className)}>
      {status.replace("_", " ")}
    </Badge>
  );
}
