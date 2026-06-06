"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { ResultSetHeader } from "mysql2";

export async function createApprovalAction(quotationId: number, rfqId: number) {
  const connection = await pool.getConnection();
  
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "MANAGER" && session.user.role !== "ADMIN" && session.user.role !== "PROCUREMENT_OFFICER")) {
      return { error: "Unauthorized" };
    }

    await connection.beginTransaction();

    // 1. Update quotation status
    await connection.query(
      "UPDATE quotations SET status = 'ACCEPTED' WHERE id = ?",
      [quotationId]
    );

    // Reject all others
    await connection.query(
      "UPDATE quotations SET status = 'REJECTED' WHERE rfq_id = ? AND id != ?",
      [rfqId, quotationId]
    );

    // 2. Update RFQ status
    await connection.query(
      "UPDATE rfqs SET status = 'AWARDED' WHERE id = ?",
      [rfqId]
    );

    // 3. Create Approval record
    await connection.query<ResultSetHeader>(
      `INSERT INTO approvals (type, reference_id, status, requested_by) 
       VALUES ('QUOTATION', ?, 'PENDING', ?)`,
      [quotationId, session.user.id]
    );

    await connection.commit();
    return { success: true };
  } catch (error: any) {
    await connection.rollback();
    console.error("Failed to process comparison decision:", error);
    return { error: "Failed to process comparison decision" };
  } finally {
    connection.release();
  }
}
