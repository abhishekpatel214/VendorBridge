import { getActivityLogs } from "@/lib/queries/activity";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Activity, FileText, ShoppingCart, Users, CheckSquare, MessageSquare } from "lucide-react";

const getIcon = (entityType: string) => {
  switch (entityType) {
    case 'RFQ': return <FileText className="h-4 w-4 text-blue-500" />;
    case 'VENDOR': return <Users className="h-4 w-4 text-purple-500" />;
    case 'QUOTATION': return <MessageSquare className="h-4 w-4 text-yellow-500" />;
    case 'APPROVAL': return <CheckSquare className="h-4 w-4 text-indigo-500" />;
    case 'PURCHASE_ORDER': return <ShoppingCart className="h-4 w-4 text-green-500" />;
    case 'INVOICE': return <FileText className="h-4 w-4 text-emerald-500" />;
    default: return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

export default async function ActivityPage() {
  const session = await auth();
  if (session?.user?.role === "VENDOR") {
    redirect("/dashboard");
  }

  const logs = await getActivityLogs();

  return (
    <div>
      <PageHeader 
        title="Activity Logs" 
        description="System-wide audit trail of user actions"
      />

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start p-4 hover:bg-muted transition-colors">
                <div className="mt-1 bg-card border rounded-full p-2 mr-4 shadow-sm">
                  {getIcon(log.entity_type)}
                </div>
                <div className="flex-1">
                  <p className="text-foreground">
                    <span className="font-semibold">{log.user_name}</span>{" "}
                    <span className="text-slate-600">{log.action.toLowerCase()}</span>{" "}
                    <span className="font-medium text-slate-700">{log.entity_type} #{log.entity_id}</span>
                  </p>
                  {log.details && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      "{log.details}"
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {formatDate(log.created_at)}
                  </p>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No activity logs found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
