import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileForm } from "./ProfileForm";
import { getTranslations } from "@/lib/i18n/server";
import pool from "@/lib/db";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Fetch fresh user data
  const [users] = await pool.query<any[]>(
    "SELECT name, email, role FROM users WHERE id = ?",
    [session.user.id]
  );

  if (users.length === 0) {
    redirect("/login");
  }

  const user = users[0];
  const t = await getTranslations();

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader 
        title={t("profile.title")} 
        description={t("profile.subtitle")} 
      />
      <ProfileForm user={user} />
    </div>
  );
}
