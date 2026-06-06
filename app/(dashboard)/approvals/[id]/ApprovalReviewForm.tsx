"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { processApprovalAction } from "./actions";
import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";

export default function ApprovalReviewForm({ approval }: { approval: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDecision = async (status: "APPROVED" | "REJECTED", e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const comments = formData.get("comments") as string;
    
    const result = await processApprovalAction(approval.id, status, comments);
    
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success(`Approval ${status.toLowerCase()} successfully`);
      router.push("/approvals");
      router.refresh();
    }
  };

  return (
    <div>
      <PageHeader 
        title="Review Approval" 
        description={`Request ID: #${approval.id}`}
        action={
          <div className="flex items-center space-x-3">
            <StatusBadge status={approval.status} />
            <Button asChild variant="outline">
              <Link href="/approvals"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Type</div>
                  <div className="font-medium">{approval.type}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Requested By</div>
                  <div className="font-medium">{approval.requester_name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Requested On</div>
                  <div className="font-medium">{formatDate(approval.created_at)}</div>
                </div>
                {approval.type === 'QUOTATION' && (
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Total Amount</div>
                    <div className="font-bold text-green-700">{formatCurrency(approval.total_amount)}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {approval.type === 'QUOTATION' && (
            <Card>
              <CardHeader>
                <CardTitle>Quotation Details (Ref: {approval.rfq_number})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="text-sm text-slate-500 mb-1">Vendor</div>
                  <div className="font-medium">{approval.vendor_name} ({approval.vendor_rating}/5.0)</div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approval.items?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-xs text-slate-500">{item.unit}</div>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">Grand Total:</TableCell>
                      <TableCell className="text-right font-bold text-green-700 text-lg">
                        {formatCurrency(approval.total_amount)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {approval.status === 'PENDING' ? (
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="comments">Approver Comments</Label>
                    <Textarea 
                      id="comments" 
                      name="comments" 
                      rows={4} 
                      disabled={isLoading} 
                      placeholder="Add any notes regarding your decision..." 
                    />
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700 w-full" 
                      disabled={isLoading}
                      onClick={(e) => handleDecision('APPROVED', e as any)}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                      Approve Request
                    </Button>
                    <Button 
                      type="submit" 
                      variant="destructive" 
                      className="w-full" 
                      disabled={isLoading}
                      onClick={(e) => handleDecision('REJECTED', e as any)}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                      Reject Request
                    </Button>
                  </div>
                  {approval.type === 'QUOTATION' && (
                    <p className="text-xs text-slate-500 text-center mt-4">
                      Approving this quotation will automatically generate a Purchase Order.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-24 bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle>Decision Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Status</div>
                  <StatusBadge status={approval.status} />
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Approver Comments</div>
                  <p className="text-slate-700 italic">
                    "{approval.comments || "No comments provided."}"
                  </p>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Processed On</div>
                  <div className="font-medium">{formatDate(approval.updated_at)}</div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
