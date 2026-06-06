import { getDashboardStats, getRecentPurchaseOrders, getRecentRFQs } from "@/lib/queries/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Users, ShoppingCart } from "lucide-react";
import { getTranslations } from "@/lib/i18n/server";
import { auth } from "@/lib/auth";
import { getVendorIdByUserId } from "@/lib/queries/vendors";

export default async function DashboardPage() {
  const t = await getTranslations();
  const session = await auth();
  const role = session?.user?.role;
  
  let vendorId: number | undefined = undefined;
  if (role === "VENDOR" && session?.user?.id) {
    const vId = await getVendorIdByUserId(parseInt(session.user.id));
    if (vId) vendorId = vId;
  }

  const stats = await getDashboardStats(vendorId);
  const recentPOs = await getRecentPurchaseOrders(vendorId);
  const recentRFQs = await getRecentRFQs(vendorId);

  return (
    <div>
      <PageHeader 
        title={t("dashboard.title")} 
        description={t("dashboard.subtitle")} 
        action={
          (role === "ADMIN" || role === "MANAGER") && (
            <div className="flex flex-wrap gap-2 sm:justify-end">
              <Button asChild variant="outline">
                <Link href="/vendors/new"><Users className="mr-2 h-4 w-4 shrink-0" /> {t("dashboard.addVendor")}</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700">
                <Link href="/rfqs/create"><FileText className="mr-2 h-4 w-4 shrink-0" /> {t("dashboard.newRFQ")}</Link>
              </Button>
            </div>
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalPOs")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPOs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.activeRFQs")}</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRFQs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.totalSpend")}</CardTitle>
            <span className="text-green-500 font-bold">$</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalSpend)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.pendingApprovals")}</CardTitle>
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
            <CardTitle>{t("dashboard.recentPOs")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPOs.map((po) => (
                <div key={po.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-green-700">{po.po_number}</p>
                    <p className="text-sm text-muted-foreground">{po.vendor_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(po.grand_total)}</p>
                    <StatusBadge status={po.status} className="mt-1" />
                  </div>
                </div>
              ))}
              {recentPOs.length === 0 && <p className="text-sm text-muted-foreground">No purchase orders found.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentRFQs")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRFQs.map((rfq) => (
                <div key={rfq.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium text-green-700">{rfq.title}</p>
                    <p className="text-sm text-muted-foreground">Deadline: {formatDate(rfq.deadline)}</p>
                  </div>
                  <div>
                    <StatusBadge status={rfq.status} />
                  </div>
                </div>
              ))}
              {recentRFQs.length === 0 && <p className="text-sm text-muted-foreground">No RFQs found.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
