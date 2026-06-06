import pool from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Invoice {
  id: number;
  invoice_number: string;
  po_id: number;
  vendor_id: number;
  amount: number;
  due_date: string;
  status: "SENT" | "PAID";
  created_at: string;
}

export async function getInvoices() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT i.*, 
            v.name as vendor_name,
            po.po_number
     FROM invoices i
     JOIN vendors v ON i.vendor_id = v.id
     JOIN purchase_orders po ON i.po_id = po.id
     ORDER BY i.created_at DESC`
  );
  return rows as any[];
}

export async function getInvoiceById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT i.*, 
            v.name as vendor_name,
            v.email as vendor_email,
            v.address as vendor_address,
            v.gst_number as vendor_gst,
            po.po_number,
            po.grand_total as po_total,
            r.title as rfq_title
     FROM invoices i
     JOIN vendors v ON i.vendor_id = v.id
     JOIN purchase_orders po ON i.po_id = po.id
     JOIN rfqs r ON po.rfq_id = r.id
     WHERE i.id = ?`,
    [id]
  );
  
  if (rows.length === 0) return null;
  const invoice = rows[0];

  // We can just show the PO items for the invoice details
  const [items] = await pool.query<RowDataPacket[]>(
    `SELECT poi.*, 
            ri.product_name, 
            ri.quantity, 
            ri.unit, 
            ri.specifications
     FROM po_items poi
     JOIN rfq_items ri ON poi.rfq_item_id = ri.id
     WHERE poi.po_id = ?`,
    [invoice.po_id]
  );

  return { ...invoice, items: items as any[] };
}

export async function generateInvoice(poId: number, dueDate: string) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Verify PO status
    const [poRows] = await connection.query<any[]>(
      "SELECT * FROM purchase_orders WHERE id = ?", [poId]
    );
    if (poRows.length === 0) throw new Error("Purchase Order not found");
    const po = poRows[0];

    if (po.status !== 'CONFIRMED') throw new Error("PO is already invoiced or completed");

    // Generate Invoice Number
    await connection.query("UPDATE counters SET value = value + 1 WHERE name = 'invoice'");
    const [counter] = await connection.query<any[]>("SELECT value FROM counters WHERE name = 'invoice'");
    const seq = counter[0].value.toString().padStart(4, '0');
    const invoice_number = `INV-${new Date().getFullYear()}-${seq}`;

    // Insert Invoice
    const [invResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO invoices (invoice_number, po_id, vendor_id, amount, due_date, status) VALUES (?, ?, ?, ?, ?, 'SENT')",
      [invoice_number, poId, po.vendor_id, po.grand_total, dueDate]
    );

    // Update PO status
    await connection.query(
      "UPDATE purchase_orders SET status = 'INVOICED' WHERE id = ?", [poId]
    );

    await connection.commit();
    return invResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
