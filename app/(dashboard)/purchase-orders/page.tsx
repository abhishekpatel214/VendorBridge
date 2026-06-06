import { getPurchaseOrders } from "@/lib/queries/pos";
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

export default async function PurchaseOrdersPage() {
  const purchaseOrders = await getPurchaseOrders();

  return (
    <div>
      <PageHeader 
        title="Purchase Orders" 
        description="Track and manage approved purchase orders"
      />

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PO Number</TableHead>
              <TableHead>RFQ Reference</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Grand Total</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchaseOrders.map((po) => (
              <TableRow key={po.id}>
                <TableCell className="font-medium text-green-700">{po.po_number}</TableCell>
                <TableCell>
                  <div className="font-medium">{po.rfq_number}</div>
                  <div className="text-xs text-slate-500">{po.rfq_title}</div>
                </TableCell>
                <TableCell>{po.vendor_name}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(po.grand_total)}
                </TableCell>
                <TableCell>{formatDate(po.created_at)}</TableCell>
                <TableCell>
                  <StatusBadge status={po.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/purchase-orders/${po.id}`}>View Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {purchaseOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No purchase orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
