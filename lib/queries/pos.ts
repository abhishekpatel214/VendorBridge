import pool from "../db";
import { RowDataPacket } from "mysql2";

export interface PurchaseOrder {
  id: number;
  po_number: string;
  rfq_id: number;
  vendor_id: number;
  quotation_id: number;
  grand_total: number;
  status: "CONFIRMED" | "INVOICED" | "COMPLETED";
  created_at: string;
}

export async function getPurchaseOrders(vendorId?: number, search?: string) {
  let query = `SELECT po.*, 
            v.name as vendor_name,
            r.rfq_number,
            r.title as rfq_title
     FROM purchase_orders po
     JOIN vendors v ON po.vendor_id = v.id
     JOIN rfqs r ON po.rfq_id = r.id`;
     
  const params: any[] = [];
  const conditions: string[] = ["1=1"];
  
  if (vendorId) {
    conditions.push("po.vendor_id = ?");
    params.push(vendorId);
  }
  
  if (search) {
    conditions.push("(po.po_number LIKE ? OR v.name LIKE ? OR r.rfq_number LIKE ?)");
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern, searchPattern);
  }
  
  query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY po.created_at DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as any[];
}

export async function getPurchaseOrderById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT po.*, 
            v.name as vendor_name,
            v.email as vendor_email,
            v.address as vendor_address,
            v.gst_number as vendor_gst,
            r.rfq_number,
            r.title as rfq_title,
            q.valid_until,
            q.remarks as quotation_remarks
     FROM purchase_orders po
     JOIN vendors v ON po.vendor_id = v.id
     JOIN rfqs r ON po.rfq_id = r.id
     JOIN quotations q ON po.quotation_id = q.id
     WHERE po.id = ?`,
    [id]
  );
  
  if (rows.length === 0) return null;
  const po = rows[0];

  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT poi.*, 
            ri.product_name, 
            ri.quantity, 
            ri.unit, 
            ri.specifications
     FROM po_items poi
     JOIN rfq_items ri ON poi.rfq_item_id = ri.id
     WHERE poi.po_id = ?`,
    [id]
  );

  return { ...po, items: items as any[] } as any;
}
