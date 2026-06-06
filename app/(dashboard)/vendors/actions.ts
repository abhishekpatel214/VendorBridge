"use server";

import { deleteVendor } from "@/lib/queries/vendors";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/queries/activity";

export async function deleteVendorAction(id: number) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "MANAGER")) {
      return { error: "Unauthorized. Only Admins and Managers can delete vendors." };
    }

    await deleteVendor(id);
    
    // Log activity
    await logActivity(
      parseInt(session.user.id),
      "DELETED",
      "VENDOR",
      id,
      "Deleted vendor record"
    );

    revalidatePath("/vendors");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete vendor:", error);
    return { error: error.message || "Failed to delete vendor" };
  }
}
