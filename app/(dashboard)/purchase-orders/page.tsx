import { getPurchaseOrders } from "@/lib/queries/pos";
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
import { SearchX, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function PurchaseOrdersPage(
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
  
  const purchaseOrders = await getPurchaseOrders(vendorId, search);

  return (
    <div>
      <PageHeader 
        title="Purchase Orders" 
        description="Track and manage approved purchase orders"
      />

      <div className="bg-card p-4 rounded-md shadow-sm border mb-6 flex gap-4 items-center">
        <form className="flex-1 max-w-md flex gap-2">
          <Input 
            name="search" 
            placeholder="Search by PO Number or Vendor..." 
            defaultValue={search}
          />
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="bg-card rounded-md shadow-sm border overflow-hidden">
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
                  <div className="text-xs text-muted-foreground">{po.rfq_title}</div>
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
          </TableBody>
        </Table>
      </div>

      {purchaseOrders.length === 0 && (
        <EmptyState 
          icon={search ? SearchX : ShoppingCart} 
          title={search ? "No matches found" : "No purchase orders"}
          description={search ? `No purchase orders found matching "${search}"` : "You don't have any purchase orders yet."}
        />
      )}
    </div>
  );
}
