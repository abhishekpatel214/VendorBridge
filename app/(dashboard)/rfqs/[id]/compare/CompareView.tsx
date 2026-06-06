"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Check, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createApprovalAction } from "./actions";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CompareView({ rfq, quotations }: { rfq: any, quotations: any[] }) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<number | null>(null);

  const handleAccept = async (quotationId: number) => {
    if (!confirm("Are you sure you want to accept this quotation and reject all others? This will initiate an approval workflow.")) return;
    
    setIsProcessing(quotationId);
    
    const result = await createApprovalAction(quotationId, rfq.id);
    
    if (result.error) {
      toast.error(result.error);
      setIsProcessing(null);
    } else {
      toast.success("Quotation accepted. Approval request created.");
      router.push("/approvals");
      router.refresh();
    }
  };

  if (quotations.length === 0) {
    return (
      <div>
        <PageHeader 
          title="Compare Quotations" 
          description={`For RFQ: ${rfq.title}`}
          action={
            <Button asChild variant="outline">
              <Link href={`/rfqs/${rfq.id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to RFQ</Link>
            </Button>
          }
        />
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No quotations</AlertTitle>
          <AlertDescription>
            No quotations have been submitted for this RFQ yet.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Find lowest bid
  const lowestBid = Math.min(...quotations.map(q => q.total_amount));

  return (
    <div>
      <PageHeader 
        title="Compare Quotations" 
        description={`For RFQ: ${rfq.title}`}
        action={
          <Button asChild variant="outline">
            <Link href={`/rfqs/${rfq.id}`}><ArrowLeft className="mr-2 h-4 w-4" /> Back to RFQ</Link>
          </Button>
        }
      />

      <div className="grid gap-6">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[250px] sticky left-0 bg-slate-50 border-r z-10">Item Description</TableHead>
                  <TableHead className="w-[100px] border-r text-center">Qty</TableHead>
                  {quotations.map(q => (
                    <TableHead key={q.id} className="min-w-[200px] text-center border-r">
                      <div className="font-bold text-slate-900 text-base">{q.vendor_name}</div>
                      <div className="text-xs text-slate-500 font-normal mt-1">Rating: {q.vendor_rating}/5.0</div>
                      <div className="text-xs text-slate-500 font-normal">Valid: {formatDate(q.valid_until)}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfq.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium sticky left-0 bg-white border-r z-10 shadow-[1px_0_0_0_#e2e8f0]">
                      {item.product_name}
                      <div className="text-xs text-slate-500 font-normal">{item.specifications}</div>
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {item.quantity} {item.unit}
                    </TableCell>
                    {quotations.map(q => {
                      const qItem = q.items.find((i: any) => i.rfq_item_id === item.id);
                      return (
                        <TableCell key={q.id} className="text-center border-r">
                          {qItem ? (
                            <div>
                              <div className="font-medium">{formatCurrency(qItem.unit_price)} / {item.unit}</div>
                              <div className="text-xs text-slate-500 mt-1">Total: {formatCurrency(qItem.total_price)}</div>
                              {qItem.remarks && (
                                <div className="text-xs italic text-slate-400 mt-1" title={qItem.remarks}>
                                  Note included
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                
                {/* General Remarks Row */}
                <TableRow className="bg-slate-50/50">
                  <TableCell colSpan={2} className="font-bold text-right sticky left-0 bg-slate-50/50 border-r z-10 shadow-[1px_0_0_0_#e2e8f0]">
                    Terms / Remarks
                  </TableCell>
                  {quotations.map(q => (
                    <TableCell key={q.id} className="text-sm border-r text-slate-600 align-top">
                      {q.remarks || <span className="text-slate-300 italic">None</span>}
                    </TableCell>
                  ))}
                </TableRow>

                {/* Grand Total Row */}
                <TableRow className="bg-slate-50">
                  <TableCell colSpan={2} className="font-bold text-right sticky left-0 bg-slate-50 border-r z-10 shadow-[1px_0_0_0_#e2e8f0] text-lg">
                    Grand Total
                  </TableCell>
                  {quotations.map(q => {
                    const isLowest = q.total_amount === lowestBid;
                    return (
                      <TableCell key={q.id} className="text-center border-r">
                        <div className={`text-xl font-bold ${isLowest ? "text-green-600" : ""}`}>
                          {formatCurrency(q.total_amount)}
                        </div>
                        {isLowest && <div className="text-xs font-bold text-green-600 uppercase tracking-wider mt-1">Lowest Bid</div>}
                        
                        <div className="mt-4 mb-2">
                          {rfq.status === 'OPEN' && (
                            <Button 
                              onClick={() => handleAccept(q.id)} 
                              disabled={isProcessing !== null}
                              className={`w-full ${isLowest ? 'bg-green-600 hover:bg-green-700' : ''}`}
                              variant={isLowest ? 'default' : 'outline'}
                            >
                              {isProcessing === q.id ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="mr-2 h-4 w-4" />
                              )}
                              Accept & Request Approval
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
