"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { error: "Invalid token" };
  if (!password || password.length < 6) return { error: "Password must be at least 6 characters" };
  if (password !== confirmPassword) return { error: "Passwords do not match" };

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verify token
    const [resets] = await connection.query<RowDataPacket[]>(
      "SELECT user_id, expires_at FROM password_resets WHERE token = ?",
      [token]
    );

    if (resets.length === 0) {
      return { error: "Invalid or expired reset token" };
    }

    const resetRecord = resets[0];

    // Check expiration
    if (new Date(resetRecord.expires_at) < new Date()) {
      return { error: "This password reset link has expired" };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password
    await connection.query(
      "UPDATE users SET password = ? WHERE id = ?",
      [hashedPassword, resetRecord.user_id]
    );

    // Delete used token (and any others for this user to be safe)
    await connection.query(
      "DELETE FROM password_resets WHERE user_id = ?",
      [resetRecord.user_id]
    );

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Reset password error:", error);
    return { error: "An unexpected error occurred" };
  } finally {
    connection.release();
  }
}
