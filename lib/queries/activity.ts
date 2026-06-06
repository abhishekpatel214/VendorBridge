import pool from "../db";
import { RowDataPacket } from "mysql2";

export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details: string | null;
  created_at: string;
}

export async function logActivity(
  userId: number, 
  action: string, 
  entityType: string, 
  entityId: number, 
  details?: string
) {
  try {
    await pool.query(
      "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)",
      [userId, action, entityType, entityId, details || null]
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
    // Don't throw, we don't want to break the main flow if logging fails
  }
}

export async function getActivityLogs(limit = 50) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT a.*, u.name as user_name, u.role as user_role
     FROM activity_logs a
     JOIN users u ON a.user_id = u.id
     ORDER BY a.created_at DESC
     LIMIT ?`,
    [limit]
  );
  return rows as any[];
}
