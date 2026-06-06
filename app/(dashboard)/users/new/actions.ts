"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { RowDataPacket } from "mysql2";
import { logActivity } from "@/lib/queries/activity";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MANAGER", "PROCUREMENT_OFFICER"]),
});

export async function createUserAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { error: "Unauthorized. Only Admins can create users." };
    }

    const data = Object.fromEntries(formData.entries());
    const validated = userSchema.safeParse(data);

    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Check if email exists
      const [existingUsers] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [validated.data.email]
      );

      if (existingUsers.length > 0) {
        throw new Error("Email already registered");
      }

      // Generate a random temporary password
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create the user
      const [userResult] = await connection.query<any>(
        "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, true)",
        [validated.data.name, validated.data.email, hashedPassword, validated.data.role]
      );
      const userId = userResult.insertId;

      // Generate password reset token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours to onboard

      await connection.query(
        "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
        [userId, token, expiresAt]
      );

      // Send onboarding email
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      const emailContent = `
        <h1>Welcome to VendorBridge</h1>
        <p>Hi ${validated.data.name},</p>
        <p>An account has been created for you on VendorBridge with the role: <strong>${validated.data.role}</strong>.</p>
        <p>Please click the link below to set your password and access your dashboard:</p>
        <a href="${resetLink}">Set Your Password</a>
        <p>This link will expire in 48 hours.</p>
      `;

      await sendEmail(validated.data.email, "Welcome to VendorBridge - Set Your Password", emailContent);

      await connection.commit();
      
      // Log activity
      await logActivity(
        parseInt(session.user.id),
        "CREATED",
        "USER",
        userId,
        `Created ${validated.data.role} account for ${validated.data.name}`
      );

      return { success: true };
    } catch (dbError: any) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error("Failed to create user:", error);
    return { error: error.message || "Failed to create user" };
  }
}
