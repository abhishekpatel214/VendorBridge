"use server";

import { generateInvoice } from "@/lib/queries/invoices";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/queries/activity";

export async function generateInvoiceAction(poId: number, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "VENDOR") {
      return { error: "Only vendors can generate invoices" };
    }

    const dueDate = formData.get("due_date") as string;
    if (!dueDate) return { error: "Due date is required" };

    const invoiceId = await generateInvoice(poId, dueDate);

    // Log activity
    await logActivity(
      parseInt(session.user.id),
      "CREATED",
      "INVOICE",
      invoiceId,
      `Generated invoice for Purchase Order #${poId}`
    );

    return { success: true, invoiceId };
  } catch (error: any) {
    console.error("Failed to generate invoice:", error);
    return { error: error.message || "Failed to generate invoice" };
  }
}
