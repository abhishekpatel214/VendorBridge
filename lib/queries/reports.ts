import pool from "../db";
import { RowDataPacket } from "mysql2";

export async function getVendorPerformanceReport() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT v.id, v.name, v.category,
            COUNT(DISTINCT q.id) as total_quotes,
            COUNT(DISTINCT CASE WHEN q.status = 'ACCEPTED' THEN q.id END) as accepted_quotes,
            SUM(po.grand_total) as total_spend
     FROM vendors v
     LEFT JOIN quotations q ON v.id = q.vendor_id
     LEFT JOIN purchase_orders po ON v.id = po.vendor_id
     GROUP BY v.id, v.name, v.category
     ORDER BY total_spend DESC`
  );
  
  return rows.map(r => ({
    ...r,
    win_rate: r.total_quotes > 0 ? ((r.accepted_quotes / r.total_quotes) * 100).toFixed(1) : "0.0"
  }));
}

export async function getSpendByCategoryReport() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT v.category, SUM(po.grand_total) as total_spend, COUNT(po.id) as po_count
     FROM purchase_orders po
     JOIN vendors v ON po.vendor_id = v.id
     GROUP BY v.category
     ORDER BY total_spend DESC`
  );
  return rows;
}
