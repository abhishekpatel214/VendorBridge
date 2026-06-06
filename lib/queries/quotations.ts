import pool from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Quotation {
  id: number;
  rfq_id: number;
  vendor_id: number;
  total_amount: number;
  valid_until: string;
  remarks: string | null;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "ACCEPTED" | "REJECTED";
  created_at: string;
}

export interface QuotationItem {
  id: number;
  quotation_id: number;
  rfq_item_id: number;
  unit_price: number;
  total_price: number;
  remarks: string | null;
}

export async function getQuotations(status = "") {
  let query = `
    SELECT q.*, r.rfq_number, r.title as rfq_title, v.name as vendor_name
    FROM quotations q
    JOIN rfqs r ON q.rfq_id = r.id
    JOIN vendors v ON q.vendor_id = v.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== "ALL") {
    query += " AND q.status = ?";
    params.push(status);
  }

  query += " ORDER BY q.created_at DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as any[];
}

export async function getQuotationById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT q.*, r.rfq_number, r.title as rfq_title, v.name as vendor_name 
     FROM quotations q
     JOIN rfqs r ON q.rfq_id = r.id
     JOIN vendors v ON q.vendor_id = v.id
     WHERE q.id = ?`,
    [id]
  );
  
  if (rows.length === 0) return null;
  const quotation = rows[0];

  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT qi.*, ri.product_name, ri.quantity, ri.unit, ri.specifications
     FROM quotation_items qi
     JOIN rfq_items ri ON qi.rfq_item_id = ri.id
     WHERE qi.quotation_id = ?`,
    [id]
  );

  return { ...quotation, items: items as any[] };
}

export async function createQuotation(
  data: Omit<Quotation, "id" | "created_at" | "status" | "total_amount">,
  items: Omit<QuotationItem, "id" | "quotation_id" | "total_price">[]
) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    let totalAmount = 0;
    const finalItems = [];

    // Calculate total
    for (const item of items) {
      const [rfqItems] = await connection.query<RowDataPacket[]>(
        "SELECT quantity FROM rfq_items WHERE id = ?", [item.rfq_item_id]
      );
      if (rfqItems.length === 0) throw new Error("Invalid RFQ item");
      
      const quantity = rfqItems[0].quantity;
      const totalPrice = quantity * item.unit_price;
      totalAmount += totalPrice;
      
      finalItems.push({
        ...item,
        total_price: totalPrice
      });
    }

    const [quotResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO quotations (rfq_id, vendor_id, total_amount, valid_until, remarks, status) VALUES (?, ?, ?, ?, ?, 'SUBMITTED')",
      [data.rfq_id, data.vendor_id, totalAmount, data.valid_until, data.remarks]
    );
    const quotationId = quotResult.insertId;

    for (const item of finalItems) {
      await connection.query(
        "INSERT INTO quotation_items (quotation_id, rfq_item_id, unit_price, total_price, remarks) VALUES (?, ?, ?, ?, ?)",
        [quotationId, item.rfq_item_id, item.unit_price, item.total_price, item.remarks]
      );
    }

    await connection.commit();
    return quotationId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function getQuotationsByRfq(rfqId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT q.*, v.name as vendor_name, v.rating as vendor_rating
     FROM quotations q
     JOIN vendors v ON q.vendor_id = v.id
     WHERE q.rfq_id = ? AND q.status != 'DRAFT'`,
    [rfqId]
  );
  
  const quotations = [];
  for (let row of rows) {
    const [items] = await pool.query<RowDataPacket[]>(
      `SELECT qi.*, ri.product_name, ri.quantity, ri.unit
       FROM quotation_items qi
       JOIN rfq_items ri ON qi.rfq_item_id = ri.id
       WHERE qi.quotation_id = ?`,
      [row.id]
    );
    quotations.push({ ...row, items: items as any[] });
  }
  
  return quotations;
}
