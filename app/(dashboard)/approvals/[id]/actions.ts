"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { ResultSetHeader } from "mysql2";
import { logActivity } from "@/lib/queries/activity";

export async function processApprovalAction(approvalId: number, status: "APPROVED" | "REJECTED", comments: string) {
  const connection = await pool.getConnection();
  
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { error: "Unauthorized. Only Managers and Admins can process approvals." };
    }

    await connection.beginTransaction();

    // 1. Get approval details
    const [approvalRows] = await connection.query<any[]>(
      "SELECT * FROM approvals WHERE id = ?", [approvalId]
    );
    if (approvalRows.length === 0) throw new Error("Approval not found");
    const approval = approvalRows[0];

    // 2. Update Approval
    await connection.query(
      "UPDATE approvals SET status = ?, comments = ?, approved_by = ?, updated_at = NOW() WHERE id = ?",
      [status, comments, session.user.id, approvalId]
    );

    // 3. Process business logic based on type and status
    if (approval.type === 'QUOTATION' && status === 'APPROVED') {
      // 3a. If approved, generate Purchase Order
      const [quotationRows] = await connection.query<any[]>(
        "SELECT * FROM quotations WHERE id = ?", [approval.reference_id]
      );
      const quotation = quotationRows[0];

      await connection.query("UPDATE counters SET value = value + 1 WHERE name = 'po'");
      const [counter] = await connection.query<any[]>("SELECT value FROM counters WHERE name = 'po'");
      const seq = counter[0].value.toString().padStart(4, '0');
      const po_number = `PO-${new Date().getFullYear()}-${seq}`;

      const [poResult] = await connection.query<ResultSetHeader>(
        "INSERT INTO purchase_orders (po_number, rfq_id, vendor_id, quotation_id, grand_total, status) VALUES (?, ?, ?, ?, ?, 'CONFIRMED')",
        [po_number, quotation.rfq_id, quotation.vendor_id, quotation.id, quotation.total_amount]
      );

      // Create PO items from Quotation Items
      const poId = poResult.insertId;
      const [qItems] = await connection.query<any[]>(
        "SELECT * FROM quotation_items WHERE quotation_id = ?", [quotation.id]
      );

      for (const item of qItems) {
        await connection.query(
          "INSERT INTO po_items (po_id, rfq_item_id, unit_price, total_price) VALUES (?, ?, ?, ?)",
          [poId, item.rfq_item_id, item.unit_price, item.total_price]
        );
      }
    } else if (approval.type === 'QUOTATION' && status === 'REJECTED') {
      // If rejected, set quotation back to SUBMITTED or REJECTED
      await connection.query(
        "UPDATE quotations SET status = 'REJECTED' WHERE id = ?",
        [approval.reference_id]
      );
      
      // We might also want to set RFQ back to OPEN to accept other quotes, 
      // but let's just mark the quote rejected for now.
    }

    await connection.commit();

    // Log activity
    await logActivity(
      parseInt(session.user.id),
      status, // APPROVED or REJECTED
      "APPROVAL",
      approvalId,
      `${status} approval for ${approval.type} #${approval.reference_id}`
    );

    return { success: true };
  } catch (error: any) {
    await connection.rollback();
    console.error("Failed to process approval:", error);
    return { error: error.message || "Failed to process approval" };
  } finally {
    connection.release();
  }
}
