import pool from "../db";
import { RowDataPacket } from "mysql2";

export async function getDashboardStats() {
  const [poRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM purchase_orders"
  );
  
  const [rfqRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM rfqs WHERE status = 'OPEN'"
  );
  
  const [spendRows] = await pool.query<RowDataPacket[]>(
    "SELECT SUM(grand_total) as total FROM purchase_orders"
  );
  
  const [approvalRows] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) as count FROM approvals WHERE status = 'PENDING'"
  );

  return {
    totalPOs: poRows[0].count || 0,
    activeRFQs: rfqRows[0].count || 0,
    totalSpend: spendRows[0].total || 0,
    pendingApprovals: approvalRows[0].count || 0,
  };
}

export async function getRecentPurchaseOrders() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT po.id, po.po_number, v.name as vendor_name, po.grand_total, po.status, po.created_at
     FROM purchase_orders po
     JOIN vendors v ON po.vendor_id = v.id
     ORDER BY po.created_at DESC
     LIMIT 5`
  );
  return rows;
}

export async function getRecentRFQs() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id, rfq_number, title, deadline, status
     FROM rfqs
     ORDER BY created_at DESC
     LIMIT 5`
  );
  return rows;
}
