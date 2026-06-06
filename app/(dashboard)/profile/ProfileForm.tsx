"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateProfileAction } from "./actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function ProfileForm({ user }: { user: any }) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateProfileAction(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(t("profile.updateProfile") + " Successful");
        e.currentTarget.reset();
        // keep name as is (from state ideally, but we rely on RSC revalidation)
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.personalInfo")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("profile.name")}</Label>
              <Input id="name" name="name" defaultValue={user.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("profile.email")}</Label>
              <Input id="email" type="email" defaultValue={user.email} disabled />
            </div>

            <div className="pt-4 border-t mt-6">
              <h3 className="text-lg font-medium mb-4">{t("profile.changePassword")}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("profile.currentPassword")}</Label>
                  <Input id="currentPassword" name="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("profile.newPassword")}</Label>
                  <Input id="newPassword" name="newPassword" type="password" />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="mt-6">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("common.save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
