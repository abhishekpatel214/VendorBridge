import { getVendorPerformanceReport, getSpendByCategoryReport } from "@/lib/queries/reports";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const session = await auth();
  if (session?.user?.role === "VENDOR") {
    redirect("/dashboard");
  }

  const vendorPerformance = await getVendorPerformanceReport();
  const spendByCategory = await getSpendByCategoryReport();

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reports & Analytics" 
        description="Insights into procurement spend and vendor performance"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">PO Count</TableHead>
                  <TableHead className="text-right">Total Spend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spendByCategory.map((cat: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{cat.category || "Uncategorized"}</TableCell>
                    <TableCell className="text-right">{cat.po_count}</TableCell>
                    <TableCell className="text-right font-bold text-green-700">
                      {formatCurrency(cat.total_spend)}
                    </TableCell>
                  </TableRow>
                ))}
                {spendByCategory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-slate-500">
                      No spend data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total Quotes</TableHead>
                <TableHead className="text-right">Accepted Quotes</TableHead>
                <TableHead className="text-right">Win Rate</TableHead>
                <TableHead className="text-right">Total Spend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vendorPerformance.map((vendor: any) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.name}</TableCell>
                  <TableCell>{vendor.category}</TableCell>
                  <TableCell className="text-right">{vendor.total_quotes}</TableCell>
                  <TableCell className="text-right">{vendor.accepted_quotes}</TableCell>
                  <TableCell className="text-right">{vendor.win_rate}%</TableCell>
                  <TableCell className="text-right font-bold text-green-700">
                    {formatCurrency(vendor.total_spend || 0)}
                  </TableCell>
                </TableRow>
              ))}
              {vendorPerformance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-slate-500">
                    No vendor performance data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
