"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { markInvoicePaidAction } from "./actions";

export default function InvoiceActions({ invoiceId }: { invoiceId: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkPaid = async () => {
    if (!confirm("Are you sure you want to mark this invoice as Paid?")) return;
    
    setIsLoading(true);
    const result = await markInvoicePaidAction(invoiceId);
    
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success("Invoice marked as paid");
      router.refresh();
    }
  };

  return (
    <Button 
      onClick={handleMarkPaid} 
      className="bg-emerald-600 hover:bg-emerald-700" 
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
      Mark as Paid
    </Button>
  );
}
