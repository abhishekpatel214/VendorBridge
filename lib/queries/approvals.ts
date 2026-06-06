import pool from "../db";
import { RowDataPacket } from "mysql2";

export interface Approval {
  id: number;
  type: "QUOTATION" | "VENDOR";
  reference_id: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_by: number;
  approved_by: number | null;
  comments: string | null;
  created_at: string;
  updated_at: string;
}

export async function getApprovals(status = "") {
  let query = `
    SELECT a.*, 
           u.name as requester_name,
           q.total_amount,
           r.rfq_number,
           r.title as rfq_title,
           v.name as vendor_name
    FROM approvals a
    LEFT JOIN users u ON a.requested_by = u.id
    LEFT JOIN quotations q ON a.reference_id = q.id AND a.type = 'QUOTATION'
    LEFT JOIN rfqs r ON q.rfq_id = r.id
    LEFT JOIN vendors v ON q.vendor_id = v.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== "ALL") {
    query += " AND a.status = ?";
    params.push(status);
  }

  query += " ORDER BY a.created_at DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as any[];
}

export async function getApprovalById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT a.*, 
           u.name as requester_name,
           q.total_amount,
           q.id as quotation_id,
           q.valid_until,
           r.id as rfq_id,
           r.rfq_number,
           r.title as rfq_title,
           r.description as rfq_description,
           v.id as vendor_id,
           v.name as vendor_name,
           v.rating as vendor_rating
    FROM approvals a
    LEFT JOIN users u ON a.requested_by = u.id
    LEFT JOIN quotations q ON a.reference_id = q.id AND a.type = 'QUOTATION'
    LEFT JOIN rfqs r ON q.rfq_id = r.id
    LEFT JOIN vendors v ON q.vendor_id = v.id
    WHERE a.id = ?`,
    [id]
  );
  
  if (rows.length === 0) return null;
  const approval = rows[0];

  // If it's a quotation approval, get the items too
  if (approval.type === 'QUOTATION') {
    const [items] = await pool.query<RowDataPacket[]>(
      `SELECT qi.*, ri.product_name, ri.quantity, ri.unit
       FROM quotation_items qi
       JOIN rfq_items ri ON qi.rfq_item_id = ri.id
       WHERE qi.quotation_id = ?`,
      [approval.quotation_id]
    );
    approval.items = items;
  }

  return approval;
}
