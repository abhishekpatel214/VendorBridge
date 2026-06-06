import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar userRole={session.user.role as string} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          user={{
            name: session.user.name || "User",
            role: session.user.role as string,
            email: session.user.email || "",
          }} 
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
