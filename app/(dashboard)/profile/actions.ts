"use server";

import pool from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
  const connection = await pool.getConnection();
  
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const userId = session.user.id;
    const name = formData.get("name") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!name) {
      return { error: "Name is required" };
    }

    // If changing password
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        return { error: "Both current and new passwords are required to change password" };
      }

      // Verify current password
      const [users] = await connection.query<any[]>(
        "SELECT password FROM users WHERE id = ?",
        [userId]
      );

      if (users.length === 0) {
        return { error: "User not found" };
      }

      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!isValidPassword) {
        return { error: "Invalid current password" };
      }

      // Update password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await connection.query(
        "UPDATE users SET name = ?, password = ? WHERE id = ?",
        [name, hashedNewPassword, userId]
      );
    } else {
      // Just update name
      await connection.query(
        "UPDATE users SET name = ? WHERE id = ?",
        [name, userId]
      );
    }

    revalidatePath("/profile");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update profile:", error);
    return { error: "Failed to update profile" };
  } finally {
    connection.release();
  }
}
