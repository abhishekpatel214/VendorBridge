"use client";

import { useLanguage, Language } from "@/lib/i18n/LanguageContext";
import { buttonVariants } from "@/components/ui/button";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import React from "react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "cursor-pointer outline-none")}
        title="Change Language"
      >
        <Languages className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Change Language</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setLanguage("en")}
          className={language === "en" ? "font-bold bg-slate-100 dark:bg-slate-800" : ""}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("hi")}
          className={language === "hi" ? "font-bold bg-slate-100 dark:bg-slate-800" : ""}
        >
          हिंदी (Hindi)
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setLanguage("gu")}
          className={language === "gu" ? "font-bold bg-slate-100 dark:bg-slate-800" : ""}
        >
          ગુજરાતી (Gujarati)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
