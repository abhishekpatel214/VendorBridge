"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { resetPasswordAction } from "./actions";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  if (!token) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">{t("resetPassword.invalidLink")}</CardTitle>
          <CardDescription>
            {t("resetPassword.invalidMessage")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/forgot-password")} className="w-full">
            {t("resetPassword.backToForgot")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.append("token", token);
      
      const result = await resetPasswordAction(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Password reset successfully! You can now log in.");
        router.push("/login");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">{t("resetPassword.title")}</CardTitle>
        <CardDescription>
          {t("resetPassword.subtitle")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t("resetPassword.newPassword")}</Label>
            <Input id="password" name="password" type="password" required disabled={isLoading} minLength={6} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("resetPassword.confirmPassword")}</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required disabled={isLoading} minLength={6} />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : t("resetPassword.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
