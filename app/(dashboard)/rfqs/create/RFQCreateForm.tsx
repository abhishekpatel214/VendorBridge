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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { createRFQAction } from "./actions";

export default function RFQCreateForm({ vendors }: { vendors: any[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([{ id: 1, product_name: "", quantity: "", unit: "PCs", specifications: "" }]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), product_name: "", quantity: "", unit: "PCs", specifications: "" }]);
  };

  const removeItem = (id: number) => {
    if (items.length === 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await createRFQAction(formData);
    
    if (result.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else {
      toast.success("RFQ created successfully");
      router.push("/rfqs");
      router.refresh();
    }
  };

  return (
    <div>
      <PageHeader 
        title="Create RFQ" 
        description="Initiate a new Request for Quotation"
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">RFQ Title *</Label>
              <Input id="title" name="title" required disabled={isLoading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={3} disabled={isLoading} />
            </div>
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="deadline">Deadline *</Label>
              <Input id="deadline" name="deadline" type="date" required disabled={isLoading} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem} disabled={isLoading}>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-md">
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label>Product/Service *</Label>
                  <Input name="product_name" required disabled={isLoading} placeholder="e.g. Laptop" />
                </div>
                <div className="col-span-12 md:col-span-4 space-y-2">
                  <Label>Specifications</Label>
                  <Input name="specifications" disabled={isLoading} placeholder="e.g. i7, 16GB RAM" />
                </div>
                <div className="col-span-6 md:col-span-2 space-y-2">
                  <Label>Quantity *</Label>
                  <Input name="quantity" type="number" min="1" step="0.01" required disabled={isLoading} />
                </div>
                <div className="col-span-5 md:col-span-1 space-y-2">
                  <Label>Unit</Label>
                  <Input name="unit" defaultValue="PCs" disabled={isLoading} />
                </div>
                <div className="col-span-1 flex justify-end pt-8">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50" 
                    onClick={() => removeItem(item.id)}
                    disabled={isLoading || items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Select Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center space-x-2 border p-3 rounded-md">
                  <input 
                    type="checkbox" 
                    id={`vendor-${vendor.id}`} 
                    name="vendor_ids" 
                    value={vendor.id} 
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-600"
                    disabled={isLoading}
                  />
                  <Label htmlFor={`vendor-${vendor.id}`} className="flex-1 cursor-pointer">
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-xs text-slate-500">{vendor.category} • {vendor.rating}/5.0</div>
                  </Label>
                </div>
              ))}
              {vendors.length === 0 && (
                <div className="col-span-full text-slate-500 text-sm">No active vendors found. Please add vendors first.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit RFQ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
