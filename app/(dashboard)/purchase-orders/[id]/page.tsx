import { getPurchaseOrderById } from "@/lib/queries/pos";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import GenerateInvoiceForm from "./GenerateInvoiceForm";
import PrintButton from "./PrintButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Printer } from "lucide-react";

export default async function PurchaseOrderDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const poId = Number(params.id);
  const po = await getPurchaseOrderById(poId);

  if (!po) notFound();

  const session = await auth();
  const isVendor = session?.user?.role === "VENDOR";

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader 
          title={`Purchase Order: ${po.po_number}`} 
          description={`Created: ${formatDate(po.created_at)}`}
          action={
            <div className="flex items-center space-x-3">
              <StatusBadge status={po.status} />
              
              {isVendor && po.status === "CONFIRMED" && (
                <GenerateInvoiceForm poId={po.id} />
              )}
              
              <PrintButton />
            </div>
          }
        />
      </div>

      <div className="bg-card p-8 border rounded-lg shadow-sm print:shadow-none print:border-none print:p-0" id="print-area">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-green-700">VendorBridge</h1>
            <p className="text-muted-foreground mt-1">Purchase Order</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-foreground">{po.po_number}</h2>
            <p className="text-muted-foreground mt-1">Date: {formatDate(po.created_at)}</p>
            <StatusBadge status={po.status} className="mt-2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-foreground mb-2 border-b pb-1">Vendor Details</h3>
            <p className="font-medium">{po.vendor_name}</p>
            <p className="text-slate-600 mt-1">{po.vendor_address || "Address not provided"}</p>
            <p className="text-slate-600 mt-1">{po.vendor_email}</p>
            {po.vendor_gst && <p className="text-slate-600 mt-1">GST: {po.vendor_gst}</p>}
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-2 border-b pb-1">Reference</h3>
            <p className="text-slate-600 mt-1"><span className="font-medium">RFQ:</span> {po.rfq_number}</p>
            <p className="text-slate-600 mt-1"><span className="font-medium">Title:</span> {po.rfq_title}</p>
            <p className="text-slate-600 mt-1"><span className="font-medium">Quote Valid Until:</span> {formatDate(po.valid_until)}</p>
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
            {po.items?.map((item: any) => (
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
              <TableCell colSpan={3} className="text-right font-bold text-lg pt-6">Grand Total:</TableCell>
              <TableCell className="text-right font-bold text-green-700 text-xl pt-6">
                {formatCurrency(po.grand_total)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        {po.quotation_remarks && (
          <div className="mt-8 pt-6 border-t">
            <h3 className="font-bold text-foreground mb-2">Terms & Conditions / Remarks</h3>
            <p className="text-slate-600 italic">{po.quotation_remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}
