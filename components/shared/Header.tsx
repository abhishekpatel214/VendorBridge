"use client";

import { Bell } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

export function Header({ user }: { user: { name: string; role: string; email: string } }) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="h-16 border-b bg-white dark:bg-background flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center">
        {/* Mobile menu button could go here */}
      </div>

      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <LanguageSwitcher />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white dark:border-slate-950"></span>
        </Button>

        <div className="flex items-center space-x-3 border-l pl-4 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.role}</p>
          </div>
          <Avatar>
            <AvatarFallback className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
