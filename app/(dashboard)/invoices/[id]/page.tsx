import { getInvoiceById } from "@/lib/queries/invoices";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import InvoiceActions from "./InvoiceActions";
import EmailInvoiceButton from "./EmailInvoiceButton";
import { Printer } from "lucide-react";

export default async function InvoiceDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const invoiceId = Number(params.id);
  const invoice = await getInvoiceById(invoiceId);

  if (!invoice) notFound();

  const session = await auth();
  const role = session?.user?.role;

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader 
          title={`Invoice: ${invoice.invoice_number}`} 
          description={`Created: ${formatDate(invoice.created_at)}`}
          action={
            <div className="flex items-center space-x-3">
              <StatusBadge status={invoice.status} />
              
              {role !== "VENDOR" && invoice.status === "SENT" && (
                <InvoiceActions invoiceId={invoice.id} />
              )}
              
              <EmailInvoiceButton invoiceId={invoice.id} />

              {/* Note: Printer requires client-side onClick, usually we put it in a client component. 
                  But since we are just prototyping the view, we can leave it as a visual button 
                  or you can use Ctrl+P. */}
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2" onClick={() => {}}>
                <Printer className="mr-2 h-4 w-4" /> Print Invoice
              </button>
            </div>
          }
        />
      </div>

      <div className="bg-card p-8 border rounded-lg shadow-sm print:shadow-none print:border-none print:p-0" id="print-area">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">INVOICE</h1>
            <p className="text-muted-foreground mt-1">{invoice.vendor_name}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-foreground">{invoice.invoice_number}</h2>
            <p className="text-muted-foreground mt-1">Date: {formatDate(invoice.created_at)}</p>
            <p className="text-muted-foreground font-medium">Due Date: {formatDate(invoice.due_date)}</p>
            <StatusBadge status={invoice.status} className="mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-foreground mb-2 border-b pb-1">Billed To</h3>
            <p className="font-medium">VendorBridge Corp.</p>
            <p className="text-slate-600 mt-1">123 Procurement Avenue</p>
            <p className="text-slate-600 mt-1">Tech City, TC 10101</p>
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-2 border-b pb-1">Reference</h3>
            <p className="text-slate-600 mt-1"><span className="font-medium">PO Number:</span> {invoice.po_number}</p>
            <p className="text-slate-600 mt-1"><span className="font-medium">RFQ Title:</span> {invoice.rfq_title}</p>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items?.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-medium">{item.product_name}</div>
                  <div className="text-xs text-muted-foreground">{item.specifications}</div>
                </TableCell>
                <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold text-lg pt-6">Total Amount Due:</TableCell>
              <TableCell className="text-right font-bold text-blue-700 text-xl pt-6">
                {formatCurrency(invoice.amount)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="mt-12 pt-6 border-t text-center text-muted-foreground text-sm">
          <p>Please make payment by {formatDate(invoice.due_date)}.</p>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
