import { getRFQs } from "@/lib/queries/rfqs";
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

export default async function RFQsPage(
  props: { searchParams: Promise<{ status?: string }> }
) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams?.status || "ALL";
  const session = await auth();
  const role = session?.user?.role;
  
  // Vendors should only see RFQs assigned to them, but we'll filter that in a real app query.
  // For now we just show the general list to managers.
  const rfqs = await getRFQs(statusFilter);

  return (
    <div>
      <PageHeader 
        title="Request for Quotations" 
        description="Manage procurement requests and track vendor bids"
        action={
          role !== "VENDOR" && (
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/rfqs/create"><Plus className="mr-2 h-4 w-4" /> Create RFQ</Link>
            </Button>
          )
        }
      />

      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
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
            {rfqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                  No RFQs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
