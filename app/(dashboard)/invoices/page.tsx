import { getInvoices } from "@/lib/queries/invoices";
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

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div>
      <PageHeader 
        title="Invoices" 
        description="Manage vendor invoices and payments"
      />

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
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
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
