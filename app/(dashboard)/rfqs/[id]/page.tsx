import { getRFQById } from "@/lib/queries/rfqs";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { auth } from "@/lib/auth";

export default async function RFQDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const rfqId = Number(params.id);
  const rfq = await getRFQById(rfqId);

  if (!rfq) {
    notFound();
  }

  const session = await auth();
  const isVendor = session?.user?.role === "VENDOR";

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`${rfq.rfq_number}: ${rfq.title}`} 
        description={`Deadline: ${formatDate(rfq.deadline)}`}
        action={
          <div className="flex items-center space-x-3">
            <StatusBadge status={rfq.status} />
            {isVendor && rfq.status === "OPEN" && (
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href={`/rfqs/${rfq.id}/submit-quotation`}>Submit Quotation</Link>
              </Button>
            )}
            {!isVendor && (
              <Button asChild variant="outline">
                <Link href={`/rfqs/${rfq.id}/compare`}>Compare Quotations</Link>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground whitespace-pre-wrap">{rfq.description || "No description provided."}</p>
            {rfq.attachment_url && (
              <div className="pt-4 border-t border-border">
                <h4 className="font-medium text-sm mb-2">Attachments</h4>
                <a href={rfq.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download Attached File
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product/Service</TableHead>
                <TableHead>Specifications</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Unit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rfq.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.specifications}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {!isVendor && (
        <Card>
          <CardHeader>
            <CardTitle>Invited Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Invited At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfq.vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.name}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell>{formatDate(vendor.invited_at)}</TableCell>
                  </TableRow>
                ))}
                {rfq.vendors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      No vendors invited.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
