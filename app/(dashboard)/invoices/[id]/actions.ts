"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";

export async function markInvoicePaidAction(invoiceId: number) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { error: "Unauthorized" };
    }

    await pool.query(
      "UPDATE invoices SET status = 'PAID' WHERE id = ?",
      [invoiceId]
    );

    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark invoice as paid:", error);
    return { error: error.message || "Failed to mark invoice as paid" };
  }
}
