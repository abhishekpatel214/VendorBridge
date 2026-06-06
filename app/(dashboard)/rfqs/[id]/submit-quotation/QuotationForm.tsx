"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { submitQuotationAction } from "./actions";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function QuotationForm({ rfq }: { rfq: any }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [prices, setPrices] = useState<Record<number, number>>({});

  const handlePriceChange = (id: number, value: string) => {
    setPrices(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const calculateTotal = () => {
    return rfq.items.reduce((total: number, item: any) => {
      return total + (item.quantity * (prices[item.id] || 0));
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await submitQuotationAction(rfq.id, formData);
    
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success("Quotation submitted successfully");
      router.push("/quotations");
      router.refresh();
    }
  };

  return (
    <div>
      <PageHeader 
        title={`Submit Quotation: ${rfq.rfq_number}`} 
        description={`For RFQ: ${rfq.title}`}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product/Service</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="w-[150px]">Unit Price ($)</TableHead>
                  <TableHead className="w-[200px]">Remarks</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfq.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <input type="hidden" name="rfq_item_id" value={item.id} />
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-xs text-slate-500">{item.specifications}</div>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Input 
                        name="unit_price" 
                        type="number" 
                        min="0.01" 
                        step="0.01" 
                        required 
                        disabled={isLoading} 
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input name="item_remarks" disabled={isLoading} placeholder="Optional notes..." />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.quantity * (prices[item.id] || 0))}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-bold">Grand Total:</TableCell>
                  <TableCell className="text-right font-bold text-green-700 text-lg">
                    {formatCurrency(calculateTotal())}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="valid_until">Quotation Valid Until *</Label>
              <Input id="valid_until" name="valid_until" type="date" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="remarks">General Remarks / Terms</Label>
              <Textarea id="remarks" name="remarks" rows={3} disabled={isLoading} placeholder="Payment terms, delivery schedule, etc..." />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit Quotation"}
          </Button>
        </div>
      </form>
    </div>
  );
}
