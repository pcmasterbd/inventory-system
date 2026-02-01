"use client";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/language-context";
import { Languages } from "lucide-react";

export function LanguageToggle() {
    const { language, setLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "bn" : "en")}
            className="flex items-center gap-2 px-3 h-10 rounded-full hover:bg-muted"
        >
            <Languages size={18} className="text-muted-foreground" />
            <span className="font-medium min-w-[24px]">
                {language === "en" ? "BN" : "EN"}
            </span>
        </Button>
    );
}
