import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = 
  | "PENDING" | "ACTIVE" | "INACTIVE" // Vendor
  | "DRAFT" | "OPEN" | "CLOSED" | "AWARDED" // RFQ
  | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" // Quotation / Approval
  | "CONFIRMED" | "INVOICED" | "SENT" | "PAID"; // PO / Invoice

const statusStyles: Record<StatusType, string> = {
  // Vendor
  ACTIVE: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
  INACTIVE: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",
  PENDING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200",
  
  // RFQ
  DRAFT: "bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200",
  OPEN: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  CLOSED: "bg-slate-200 text-slate-800 hover:bg-slate-300 border-slate-300",
  AWARDED: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
  
  // Quotation / Approval
  SUBMITTED: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  UNDER_REVIEW: "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200",
  ACCEPTED: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
  REJECTED: "bg-red-100 text-red-800 hover:bg-red-200 border-red-200",

  // PO / Invoice
  CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-200 border-green-200",
  INVOICED: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  SENT: "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200",
  PAID: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = statusStyles[status as StatusType] || "bg-slate-100 text-slate-800";
  
  return (
    <Badge variant="outline" className={cn("font-medium", style, className)}>
      {status.replace("_", " ")}
    </Badge>
  );
}
