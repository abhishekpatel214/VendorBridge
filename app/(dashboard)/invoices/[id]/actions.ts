"use server";

import { sendEmail } from "@/lib/email";
import { getInvoiceById, markInvoicePaid } from "@/lib/queries/invoices";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/queries/activity";

export async function emailInvoiceAction(invoiceId: number) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return { error: "Invoice not found" };
    }

    // Determine recipient. If vendor sends it, it goes to procurement/admin. 
    // If procurement sends it, it goes to vendor.
    // For this prototype, we'll just send it to a mock/demo address or the logged-in user's email 
    // just to demonstrate functionality without spamming real addresses, or we can use the vendor's email.
    const recipientEmail = "vendor@example.com"; 

    const emailContent = `
      <h1>Invoice #${invoice.invoice_number}</h1>
      <p><strong>Vendor:</strong> ${invoice.vendor_name}</p>
      <p><strong>Total Amount:</strong> $${invoice.amount}</p>
      <p><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
      <p><strong>Status:</strong> ${invoice.status}</p>
      <br />
      <p>Please log in to VendorBridge to view and process the full invoice details.</p>
    `;

    await sendEmail(recipientEmail, `Invoice ${invoice.invoice_number} from ${invoice.vendor_name}`, emailContent);

    // Update status to SENT if it was CONFIRMED/INVOICED
    // We would need to update DB here, but for now just sending is fine
    
    return { success: true };
  } catch (error) {
    console.error("Failed to email invoice:", error);
    return { error: "Failed to send email" };
  }
}

export async function markInvoicePaidAction(invoiceId: number) {
  const session = await auth();
  if (!session?.user || session.user.role === "VENDOR") {
    return { error: "Unauthorized" };
  }
  try {
    await markInvoicePaid(invoiceId);

    // Log activity
    await logActivity(
      parseInt(session.user.id),
      "UPDATED",
      "INVOICE",
      invoiceId,
      `Marked invoice as PAID`
    );

    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark invoice paid:", error);
    return { error: error.message || "Failed to mark paid" };
  }
}
