"use server";

import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

export async function registerUserAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const companyName = formData.get("companyName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !password) {
    return { error: "Missing required fields" };
  }

  const name = `${firstName} ${lastName}`;

  const connection = await pool.getConnection();

  try {
    // Check if email exists
    const [existing] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return { error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Default to VENDOR role for external signups
    const role = "VENDOR";
    
    // For VENDORs, we should probably set is_active to FALSE requiring approval, 
    // but for simplicity in this MVP, we'll set it to TRUE so they can log in.
    const isActive = true;

    await connection.beginTransaction();

    const [userResult] = await connection.query<any>(
      "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, isActive]
    );

    const userId = userResult.insertId;

    if (companyName) {
      // Create a vendor record linked to this user (we don't have user_id in vendors table yet, but we will insert them into vendors)
      // Actually our vendors table structure is: name, category, email, phone, gst_number, status, rating
      await connection.query(
        "INSERT INTO vendors (name, category, email, phone, gst_number, status, rating) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [companyName, "General", email, "", "", "PENDING", 0]
      );
    }

    await connection.commit();
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("Signup error:", error);
    return { error: "Failed to register user" };
  } finally {
    connection.release();
  }
}
