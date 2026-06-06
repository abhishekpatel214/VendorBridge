import pool from "../db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export async function getUsers() {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
  );
  return rows as User[];
}

export async function getUserById(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?",
    [id]
  );
  return rows.length ? (rows[0] as User) : null;
}
