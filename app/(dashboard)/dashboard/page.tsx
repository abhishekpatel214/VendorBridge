import { getDashboardStats, getRecentPurchaseOrders, getRecentRFQs } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Users, ShoppingCart } from "lucide-react";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const recentPOs = await getRecentPurchaseOrders();
  const recentRFQs = await getRecentRFQs();

  return (
    <div>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your procurement activities" 
        action={
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href="/vendors"><Users className="mr-2 h-4 w-4" /> Add Vendor</Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/rfqs/create"><FileText className="mr-2 h-4 w-4" /> New RFQ</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchase Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPOs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active RFQs</CardTitle>
            <FileText className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRFQs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            <span className="text-green-500 font-bold">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpend)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <span className="text-yellow-500 font-bold">!</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPOs.map((po) => (
                <div key={po.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-green-700">{po.po_number}</p>
                    <p className="text-sm text-slate-500">{po.vendor_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(po.grand_total)}</p>
                    <StatusBadge status={po.status} className="mt-1" />
                  </div>
                </div>
              ))}
              {recentPOs.length === 0 && <p className="text-sm text-slate-500">No purchase orders found.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent RFQs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRFQs.map((rfq) => (
                <div key={rfq.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-green-700">{rfq.title}</p>
                    <p className="text-sm text-slate-500">Deadline: {formatDate(rfq.deadline)}</p>
                  </div>
                  <div>
                    <StatusBadge status={rfq.status} />
                  </div>
                </div>
              ))}
              {recentRFQs.length === 0 && <p className="text-sm text-slate-500">No RFQs found.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
