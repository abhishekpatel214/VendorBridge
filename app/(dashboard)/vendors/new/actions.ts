"use server";

import { createVendor } from "@/lib/queries/vendors";
import { auth } from "@/lib/auth";
import { z } from "zod";

const vendorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  category: z.string().optional(),
  phone: z.string().optional(),
  gst_number: z.string().optional(),
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
    const validated = vendorSchema.safeParse(data);

    if (!validated.success) {
      return { error: validated.error.errors[0].message };
    }

    await createVendor({
      ...validated.data,
      category: validated.data.category || null,
      phone: validated.data.phone || null,
      gst_number: validated.data.gst_number || null,
      country: validated.data.country || null,
      address: validated.data.address || null,
      status: "ACTIVE", // Auto active for manager created vendors
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to create vendor:", error);
    return { error: error.message || "Failed to create vendor" };
  }
}
