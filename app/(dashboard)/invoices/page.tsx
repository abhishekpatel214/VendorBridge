import { getInvoices } from "@/lib/queries/invoices";
import { getVendorIdByUserId } from "@/lib/queries/vendors";
import { auth } from "@/lib/auth";
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
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchX, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function InvoicesPage(
  props: { searchParams: Promise<{ search?: string }> }
) {
  const searchParams = await props.searchParams;
  const search = searchParams?.search || "";
  const session = await auth();
  const role = session?.user?.role;
  let vendorId: number | undefined = undefined;
  
  if (role === "VENDOR" && session?.user?.id) {
    const vId = await getVendorIdByUserId(parseInt(session.user.id));
    if (vId) vendorId = vId;
  }

  const invoices = await getInvoices(vendorId, search);

  return (
    <div>
      <PageHeader 
        title="Invoices" 
        description="Manage vendor invoices and payments"
      />

      <div className="bg-card p-4 rounded-md shadow-sm border mb-6 flex gap-4 items-center">
        <form className="flex-1 max-w-md flex gap-2">
          <Input 
            name="search" 
            placeholder="Search by Invoice #, PO #, or Vendor..." 
            defaultValue={search}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="bg-card rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>PO Reference</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium text-blue-700">{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.po_number}</TableCell>
                <TableCell>{invoice.vendor_name}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(invoice.amount)}
                </TableCell>
                <TableCell className={new Date(invoice.due_date) < new Date() && invoice.status !== 'PAID' ? "text-red-600 font-bold" : ""}>
                  {formatDate(invoice.due_date)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={invoice.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/invoices/${invoice.id}`}>View / Print</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {invoices.length === 0 && (
        <EmptyState 
          icon={search ? SearchX : Receipt} 
          title={search ? "No matches found" : "No invoices"}
          description={search ? `No invoices found matching "${search}"` : "You don't have any invoices yet."}
        />
      )}
    </div>
  );
}
