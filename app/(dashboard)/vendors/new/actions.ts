"use server";

import { checkVendorExists } from "@/lib/queries/vendors";
import { auth } from "@/lib/auth";
import { z } from "zod";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { RowDataPacket } from "mysql2";
import { logActivity } from "@/lib/queries/activity";

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  category: z.string().optional(),
  phone: z.string()
    .regex(/^\+\d{1,3}\s?\d{4,14}$/, "Phone must include country code (e.g., +91 9876543210)")
    .optional()
    .or(z.literal("")),
  gst_number: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST Number format (e.g., 22AAAAA0000A1Z5)")
    .optional()
    .or(z.literal("")),
  country: z.string().optional(),
  address: z.string().optional(),
});

export async function createVendorAction(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { error: "Unauthorized" };
    }

    const data = Object.fromEntries(formData.entries());
    
    // Combine phone fields if present
    if (data.phoneNumber) {
      data.phone = `${data.countryCode} ${data.phoneNumber}`;
    }
    
    const validated = vendorSchema.safeParse(data);

    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const duplicateError = await checkVendorExists(
      validated.data.email, 
      validated.data.phone || null
    );

    if (duplicateError) {
      return { error: duplicateError };
    }

    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Check if user email already exists
      const [existingUsers] = await connection.query<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [validated.data.email]
      );

      if (existingUsers.length > 0) {
        throw new Error("Email already in use by a user account");
      }

      // Generate a random temporary password
      const tempPassword = crypto.randomBytes(16).toString("hex");
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // 1. Create the user
      const [userResult] = await connection.query<any>(
        "INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, 'VENDOR', true)",
        [validated.data.name, validated.data.email, hashedPassword]
      );
      const userId = userResult.insertId;

      // 2. Create the vendor
      const [vendorResult] = await connection.query<any>(
        `INSERT INTO vendors (name, category, gst_number, email, phone, address, country, status, user_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          validated.data.name,
          validated.data.category || null,
          validated.data.gst_number || null,
          validated.data.email,
          validated.data.phone || null,
          validated.data.address || null,
          validated.data.country || null,
          "ACTIVE",
          userId
        ]
      );
      const vendorId = vendorResult.insertId;

      // 3. Generate password reset token for onboarding
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours to onboard

      await connection.query(
        "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
        [userId, token, expiresAt]
      );

      // 4. Send the onboarding email
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      const emailContent = `
        <h1>Welcome to VendorBridge</h1>
        <p>Hi ${validated.data.name},</p>
        <p>An account has been created for you on VendorBridge.</p>
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
        "VENDOR",
        vendorId,
        `Created vendor profile for ${validated.data.name}`
      );

      return { success: true };
    } catch (dbError: any) {
      await connection.rollback();
      throw dbError;
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error("Failed to create vendor:", error);
    return { error: error.message || "Failed to create vendor" };
  }
}
