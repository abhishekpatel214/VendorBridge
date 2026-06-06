"use server";

import { createRFQ } from "@/lib/queries/rfqs";
import { auth } from "@/lib/auth";

export async function createRFQAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role === "VENDOR") {
      return { error: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadline = formData.get("deadline") as string;

    // Parse items
    const itemNames = formData.getAll("product_name") as string[];
    const itemSpecs = formData.getAll("specifications") as string[];
    const itemQtys = formData.getAll("quantity") as string[];
    const itemUnits = formData.getAll("unit") as string[];

    const items = itemNames.map((name, i) => ({
      product_name: name,
      specifications: itemSpecs[i] || "",
      quantity: parseFloat(itemQtys[i]) || 0,
      unit: itemUnits[i] || "Unit",
    })).filter(item => item.product_name && item.quantity > 0);

    if (items.length === 0) {
      return { error: "At least one item is required." };
    }

    // Parse vendors
    const vendorIds = formData.getAll("vendor_ids").map(id => parseInt(id as string));
    
    if (vendorIds.length === 0) {
      return { error: "At least one vendor must be selected." };
    }

    const rfqId = await createRFQ(
      {
        title,
        description,
        deadline,
        created_by: parseInt(session.user.id),
      },
      items,
      vendorIds
    );

    return { success: true, rfqId };
  } catch (error: any) {
    console.error("Failed to create RFQ:", error);
    return { error: error.message || "Failed to create RFQ" };
  }
}
