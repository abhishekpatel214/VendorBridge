import pool from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface RFQ {
  id: number;
  rfq_number: string;
  title: string;
  description: string;
  deadline: string;
  status: "DRAFT" | "OPEN" | "CLOSED" | "AWARDED";
  created_by: number;
  created_at: string;
  attachment_url?: string;
}

export interface RFQItem {
  id: number;
  rfq_id: number;
  product_name: string;
  quantity: number;
  unit: string;
  specifications: string;
}

export async function getRFQs(status = "", vendorId?: number, search?: string) {
  let query = "SELECT * FROM rfqs";
  const params: any[] = [];
  const conditions: string[] = ["1=1"];

  if (status && status !== "ALL") {
    conditions.push("status = ?");
    params.push(status);
  }

  if (vendorId) {
    conditions.push("id IN (SELECT rfq_id FROM rfq_vendors WHERE vendor_id = ?)");
    params.push(vendorId);
  }
  
  if (search) {
    conditions.push("(rfq_number LIKE ? OR title LIKE ?)");
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
  }

  query += " WHERE " + conditions.join(" AND ");
  query += " ORDER BY created_at DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  
  // Get vendor counts and quote counts per RFQ
  for (let rfq of rows) {
    const [vendors] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM rfq_vendors WHERE rfq_id = ?",
      [rfq.id]
    );
    const [quotes] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM quotations WHERE rfq_id = ? AND status != 'DRAFT'",
      [rfq.id]
    );
    rfq.vendors_count = vendors[0].count;
    rfq.quotes_count = quotes[0].count;
  }

  return rows as any[];
}

export async function getRFQById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM rfqs WHERE id = ?",
    [id]
  );
  
  if (rows.length === 0) return null;
  const rfq = rows[0] as RFQ;

  const [items] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM rfq_items WHERE rfq_id = ?",
    [id]
  );

  const [vendors] = await pool.query<RowDataPacket[]>(
    `SELECT v.id, v.name, v.email, rv.invited_at 
     FROM rfq_vendors rv
     JOIN vendors v ON rv.vendor_id = v.id
     WHERE rv.rfq_id = ?`,
    [id]
  );

  return { ...rfq, items: items as RFQItem[], vendors: vendors as any[] };
}

export async function createRFQ(
  data: Omit<RFQ, "id" | "rfq_number" | "created_at" | "status">, 
  items: Omit<RFQItem, "id" | "rfq_id">[],
  vendorIds: number[]
) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. Get next sequence number
    await connection.query("UPDATE counters SET value = value + 1 WHERE name = 'rfq'");
    const [counter] = await connection.query<RowDataPacket[]>("SELECT value FROM counters WHERE name = 'rfq'");
    const seq = counter[0].value.toString().padStart(4, '0');
    const rfq_number = `RFQ-${new Date().getFullYear()}-${seq}`;

    // 2. Insert RFQ
    const [rfqResult] = await connection.query<ResultSetHeader>(
      "INSERT INTO rfqs (rfq_number, title, description, deadline, created_by, status, attachment_url) VALUES (?, ?, ?, ?, ?, 'OPEN', ?)",
      [rfq_number, data.title, data.description, data.deadline, data.created_by, data.attachment_url || null]
    );
    const rfqId = rfqResult.insertId;

    // 3. Insert items
    for (const item of items) {
      await connection.query(
        "INSERT INTO rfq_items (rfq_id, product_name, quantity, unit, specifications) VALUES (?, ?, ?, ?, ?)",
        [rfqId, item.product_name, item.quantity, item.unit, item.specifications]
      );
    }

    // 4. Assign vendors
    for (const vendorId of vendorIds) {
      await connection.query(
        "INSERT INTO rfq_vendors (rfq_id, vendor_id) VALUES (?, ?)",
        [rfqId, vendorId]
      );
    }

    await connection.commit();
    return rfqId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
