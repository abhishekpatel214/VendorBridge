import { NextResponse } from "next/server";
import { getVendorPerformanceReport } from "@/lib/queries/reports";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role === "VENDOR") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "vendor-performance") {
    try {
      const data = await getVendorPerformanceReport();
      
      // Convert to CSV
      const headers = ["Vendor Name", "Category", "Total Quotes", "Accepted Quotes", "Win Rate (%)", "Total Spend"];
      const rows = data.map((v: any) => [
        `"${v.name}"`,
        `"${v.category}"`,
        v.total_quotes,
        v.accepted_quotes,
        v.win_rate,
        v.total_spend || 0
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="vendor-performance.csv"'
        }
      });
    } catch (error) {
      console.error("Export error:", error);
      return new NextResponse("Failed to generate export", { status: 500 });
    }
  }

  return new NextResponse("Invalid export type", { status: 400 });
}
