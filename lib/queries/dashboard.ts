import pool from "../db";
import { RowDataPacket } from "mysql2";

export async function getDashboardStats(vendorId?: number) {
  const poQuery = vendorId 
    ? ["SELECT COUNT(*) as count FROM purchase_orders WHERE vendor_id = ?", [vendorId]]
    : ["SELECT COUNT(*) as count FROM purchase_orders", []];
  const [poRows] = await pool.query<RowDataPacket[]>(poQuery[0] as string, poQuery[1]);
  
  const rfqQuery = vendorId
    ? ["SELECT COUNT(DISTINCT r.id) as count FROM rfqs r JOIN rfq_vendors rv ON r.id = rv.rfq_id WHERE rv.vendor_id = ? AND r.status = 'OPEN'", [vendorId]]
    : ["SELECT COUNT(*) as count FROM rfqs WHERE status = 'OPEN'", []];
  const [rfqRows] = await pool.query<RowDataPacket[]>(rfqQuery[0] as string, rfqQuery[1]);
  
  const spendQuery = vendorId
    ? ["SELECT SUM(grand_total) as total FROM purchase_orders WHERE vendor_id = ?", [vendorId]]
    : ["SELECT SUM(grand_total) as total FROM purchase_orders", []];
  const [spendRows] = await pool.query<RowDataPacket[]>(spendQuery[0] as string, spendQuery[1]);
  
  // Pending approvals usually only matter to managers, but if we show it to vendors, they should see 0
  const approvalQuery = vendorId
    ? ["SELECT 0 as count", []]
    : ["SELECT COUNT(*) as count FROM approvals WHERE status = 'PENDING'", []];
  const [approvalRows] = await pool.query<RowDataPacket[]>(approvalQuery[0] as string, approvalQuery[1]);

  return {
    totalPOs: poRows[0].count || 0,
    activeRFQs: rfqRows[0].count || 0,
    totalSpend: spendRows[0].total || 0,
    pendingApprovals: approvalRows[0].count || 0,
  };
}

export async function getRecentPurchaseOrders(vendorId?: number) {
  let query = `SELECT po.id, po.po_number, v.name as vendor_name, po.grand_total, po.status, po.created_at
     FROM purchase_orders po
     JOIN vendors v ON po.vendor_id = v.id`;
  const params: any[] = [];
  
  if (vendorId) {
    query += " WHERE po.vendor_id = ?";
    params.push(vendorId);
  }
  
  query += " ORDER BY po.created_at DESC LIMIT 5";
  
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
}

export async function getRecentRFQs(vendorId?: number) {
  let query = `SELECT r.id, r.rfq_number, r.title, r.deadline, r.status
     FROM rfqs r`;
  const params: any[] = [];
  
  if (vendorId) {
    query += ` JOIN rfq_vendors rv ON r.id = rv.rfq_id WHERE rv.vendor_id = ?`;
    params.push(vendorId);
  }
  
  query += " ORDER BY r.created_at DESC LIMIT 5";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows;
}
