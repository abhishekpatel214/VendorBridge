import { getQuotations } from "@/lib/queries/quotations";
import { getVendorIdByUserId } from "@/lib/queries/vendors";
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
import { formatDate, formatCurrency } from "@/lib/utils";
import { auth } from "@/lib/auth";

export default async function QuotationsPage(
  props: { searchParams: Promise<{ status?: string }> }
) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status || "ALL";
  const session = await auth();
  const role = session?.user?.role;
  let vendorId: number | undefined = undefined;
  
  if (role === "VENDOR" && session?.user?.id) {
    const vId = await getVendorIdByUserId(parseInt(session.user.id));
    if (vId) vendorId = vId;
  }
  
  const quotations = await getQuotations(statusFilter, vendorId);

  return (
    <div>
      <PageHeader 
        title="Quotations" 
        description="Track and review submitted vendor bids"
      />

      <div className="bg-card rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFQ Reference</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Valid Until</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.map((quotation) => (
              <TableRow key={quotation.id}>
                <TableCell>
                  <div className="font-medium">{quotation.rfq_number}</div>
                  <div className="text-xs text-muted-foreground">{quotation.rfq_title}</div>
                </TableCell>
                <TableCell>{quotation.vendor_name}</TableCell>
                <TableCell>{formatDate(quotation.valid_until)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(quotation.total_amount)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={quotation.status} />
                </TableCell>
                <TableCell className="text-right">
                  {/* Actions depending on role and status */}
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/quotations/${quotation.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {quotations.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No quotations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
