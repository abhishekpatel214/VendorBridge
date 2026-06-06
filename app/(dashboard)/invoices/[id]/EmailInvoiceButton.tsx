"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { emailInvoiceAction } from "./actions";

export default function EmailInvoiceButton({ invoiceId }: { invoiceId: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEmail = async () => {
    setIsLoading(true);
    const result = await emailInvoiceAction(invoiceId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Invoice sent via email successfully!");
    }
    setIsLoading(false);
  };

  return (
    <Button 
      onClick={handleEmail} 
      variant="outline"
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
      Email Invoice
    </Button>
  );
}
