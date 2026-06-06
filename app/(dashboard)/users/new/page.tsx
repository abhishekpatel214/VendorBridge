import { PageHeader } from "@/components/shared/PageHeader";
import { UserForm } from "./UserForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewUserPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader 
        title="Add New User" 
        description="Create a new internal user account (Manager, Procurement Officer, etc.)"
        backLink="/users"
      />
      <UserForm />
    </div>
  );
}
