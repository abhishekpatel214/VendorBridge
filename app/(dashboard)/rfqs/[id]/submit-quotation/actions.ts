"use server";

import { createQuotation } from "@/lib/queries/quotations";
import { getVendorIdByUserId } from "@/lib/queries/vendors";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/queries/activity";

export async function submitQuotationAction(rfqId: number, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "VENDOR") {
      return { error: "Only vendors can submit quotations" };
    }

    const vendorId = await getVendorIdByUserId(parseInt(session.user.id));
    if (!vendorId) {
      return { error: "Vendor profile not found for this user." };
    }

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

    // Log activity
    await logActivity(
      parseInt(session.user.id),
      "CREATED",
      "QUOTATION",
      quotationId,
      `Submitted quotation for RFQ #${rfqId}`
    );

    return { success: true, quotationId };
  } catch (error: any) {
    console.error("Failed to submit quotation:", error);
    return { error: error.message || "Failed to submit quotation" };
  }
}
