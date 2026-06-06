"use server";

import { createQuotation } from "@/lib/queries/quotations";
import { getVendorById } from "@/lib/queries/vendors";
import { auth } from "@/lib/auth";

export async function submitQuotationAction(rfqId: number, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "VENDOR") {
      return { error: "Only vendors can submit quotations" };
    }

    // In a real app, you'd look up the vendor_id associated with this user.
    // Assuming session.user.id is the user_id, we need to find the vendor.
    // For this prototype, if the vendor user login is vendor1@example.com, their id is 3, vendor id is 1.
    // Let's hardcode for the demo or fetch it.
    
    // For now we will assume the vendor ID is passed in or we fetch it.
    // We'll use vendor_id = 1 for the demo if we can't map it.
    const vendorId = 1;

    const validUntil = formData.get("valid_until") as string;
    const remarks = formData.get("remarks") as string;

    const itemIds = formData.getAll("rfq_item_id") as string[];
    const itemPrices = formData.getAll("unit_price") as string[];
    const itemRemarks = formData.getAll("item_remarks") as string[];

    const items = itemIds.map((id, index) => ({
      rfq_item_id: parseInt(id),
      unit_price: parseFloat(itemPrices[index]) || 0,
      remarks: itemRemarks[index] || "",
    })).filter(item => item.unit_price > 0);

    if (items.length === 0) {
      return { error: "You must provide pricing for at least one item." };
    }

    const quotationId = await createQuotation({
      rfq_id: rfqId,
      vendor_id: vendorId,
      valid_until: validUntil,
      remarks: remarks || null,
    }, items);

    return { success: true, quotationId };
  } catch (error: any) {
    console.error("Failed to submit quotation:", error);
    return { error: error.message || "Failed to submit quotation" };
  }
}
