"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex h-[80vh] w-full flex-col items-center justify-center space-y-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground max-w-[500px] mx-auto">
          We encountered an error while trying to load this page. Please try again or contact support if the issue persists.
        </p>
      </div>
      <div className="flex space-x-4 pt-4">
        <Button onClick={() => reset()} className="bg-green-600 hover:bg-green-700">
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
