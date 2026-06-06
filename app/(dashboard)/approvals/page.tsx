import { getApprovals } from "@/lib/queries/approvals";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ApprovalsPage(
  props: { searchParams: Promise<{ status?: string }> }
) {
  const session = await auth();
  if (session?.user?.role === "VENDOR") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status || "ALL";
  const approvals = await getApprovals(statusFilter);

  return (
    <div>
      <PageHeader 
        title="Approvals" 
        description="Review and process pending procurement requests"
      />

      <div className="bg-card rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {approvals.map((approval) => (
              <TableRow key={approval.id}>
                <TableCell>
                  <span className="font-medium text-foreground bg-muted px-2 py-1 rounded text-xs">
                    {approval.type}
                  </span>
                </TableCell>
                <TableCell>
                  {approval.type === 'QUOTATION' ? (
                    <div>
                      <div className="font-medium text-green-700">{approval.rfq_number}</div>
                      <div className="text-xs text-muted-foreground">Vendor: {approval.vendor_name}</div>
                    </div>
                  ) : (
                    <div>Vendor ID: {approval.reference_id}</div>
                  )}
                </TableCell>
                <TableCell>{approval.requester_name}</TableCell>
                <TableCell className="font-medium">
                  {approval.total_amount ? formatCurrency(approval.total_amount) : "-"}
                </TableCell>
                <TableCell>{formatDate(approval.created_at)}</TableCell>
                <TableCell>
                  <StatusBadge status={approval.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/approvals/${approval.id}`}>Review</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {approvals.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No approval requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
