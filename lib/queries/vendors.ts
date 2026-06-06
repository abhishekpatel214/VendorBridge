import pool from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface Vendor {
  id: number;
  user_id: number | null;
  name: string;
  category: string | null;
  gst_number: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  country: string | null;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  rating: number;
  created_at: string;
}

export async function getVendors(search = "", category = "", status = "") {
  let query = "SELECT * FROM vendors WHERE 1=1";
  const params: any[] = [];

  if (search) {
    query += " AND (name LIKE ? OR email LIKE ? OR gst_number LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }

  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  query += " ORDER BY created_at DESC";

  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return rows as Vendor[];
}

export async function getVendorById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM vendors WHERE id = ?",
    [id]
  );
  return rows.length ? (rows[0] as Vendor) : null;
}

export async function createVendor(data: Omit<Vendor, "id" | "created_at" | "rating">) {
  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO vendors (name, category, gst_number, email, phone, address, country, status, user_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.category, data.gst_number, data.email, data.phone, data.address, data.country, data.status, data.user_id || null]
  );
  return result.insertId;
}

export async function updateVendorStatus(id: number, status: string) {
  await pool.query("UPDATE vendors SET status = ? WHERE id = ?", [status, id]);
}

export async function getVendorIdByUserId(userId: number): Promise<number | null> {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id FROM vendors WHERE user_id = ?",
    [userId]
  );
  return rows.length ? rows[0].id : null;
}

export async function checkVendorExists(email: string, phone: string | null) {
  const query = phone 
    ? "SELECT id, email, phone FROM vendors WHERE email = ? OR phone = ?"
    : "SELECT id, email, phone FROM vendors WHERE email = ?";
    
  const params = phone ? [email, phone] : [email];
  
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  
  if (rows.length > 0) {
    const existing = rows[0];
    if (existing.email === email) return "Email already exists";
    if (existing.phone === phone) return "Phone number already exists";
    return "Vendor already exists";
  }
  return null;
}

export async function deleteVendor(id: number) {
  await pool.query("DELETE FROM vendors WHERE id = ?", [id]);
}

