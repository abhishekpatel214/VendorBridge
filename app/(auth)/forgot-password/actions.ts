"use server";

import pool from "@/lib/db";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";
import { RowDataPacket } from "mysql2";

export async function forgotPasswordAction(formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) return { error: "Email is required" };

  try {
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT id, name FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      // Don't reveal if user exists
      return { success: true };
    }

    const user = users[0];
    const token = crypto.randomBytes(32).toString("hex");
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await pool.query(
      "INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)",
      [user.id, token, expiresAt]
    );

    // In production, use standard process.env.NEXT_PUBLIC_APP_URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    const emailContent = `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.name},</p>
      <p>We received a request to reset your VendorBridge password.</p>
      <p>Click the link below to set a new password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you didn't request this, you can safely ignore this email. This link will expire in 1 hour.</p>
    `;

    // Send email using our existing mail utility
    await sendEmail(email, "Reset Your VendorBridge Password", emailContent);
    
    // For local dev, log the token
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(`Reset link: ${resetLink}`);

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "An unexpected error occurred" };
  }
}
