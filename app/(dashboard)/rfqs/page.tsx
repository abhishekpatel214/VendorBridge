import { getRFQs } from "@/lib/queries/rfqs";
import { getVendorIdByUserId } from "@/lib/queries/vendors";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchX, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function RFQsPage(
  props: { searchParams: Promise<{ status?: string, search?: string }> }
) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status || "ALL";
  const search = searchParams?.search || "";
  const session = await auth();
  const role = session?.user?.role;
  let vendorId: number | undefined = undefined;
  
  if (role === "VENDOR" && session?.user?.id) {
    const vId = await getVendorIdByUserId(parseInt(session.user.id));
    if (vId) vendorId = vId;
  }
  
  const rfqs = await getRFQs(statusFilter, vendorId, search);

  return (
    <div>
      <PageHeader 
        title="Request for Quotations" 
        description="Manage procurement requests and track vendor bids"
        action={
          (role === "ADMIN" || role === "MANAGER") && (
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/rfqs/create"><Plus className="mr-2 h-4 w-4" /> Create RFQ</Link>
            </Button>
          )
        }
      />

      <div className="bg-card p-4 rounded-md shadow-sm border mb-6 flex gap-4 items-center">
        <form className="flex-1 max-w-md flex gap-2">
          <Input 
            name="search" 
            placeholder="Search by RFQ Number or Title..." 
            defaultValue={search}
          />
          {statusFilter !== "ALL" && <input type="hidden" name="status" value={statusFilter} />}
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="bg-card rounded-md shadow-sm border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFQ Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Vendors Invited</TableHead>
              <TableHead>Quotes Received</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.map((rfq) => (
              <TableRow key={rfq.id}>
                <TableCell className="font-medium text-green-700">{rfq.rfq_number}</TableCell>
                <TableCell>{rfq.title}</TableCell>
                <TableCell>{formatDate(rfq.deadline)}</TableCell>
                <TableCell>{rfq.vendors_count}</TableCell>
                <TableCell>{rfq.quotes_count}</TableCell>
                <TableCell>
                  <StatusBadge status={rfq.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/rfqs/${rfq.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rfqs.length === 0 && (
        <EmptyState 
          icon={search ? SearchX : FileText} 
          title={search ? "No matches found" : "No RFQs"}
          description={search ? `No RFQs found matching "${search}"` : "You don't have any Request for Quotations yet."}
          actionLabel={(role === "ADMIN" || role === "MANAGER") && !search ? "Create New RFQ" : undefined}
          actionHref={(role === "ADMIN" || role === "MANAGER") && !search ? "/rfqs/create" : undefined}
        />
      )}
    </div>
  );
}
