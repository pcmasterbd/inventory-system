"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en, Dictionary } from "@/lib/i18n/dictionaries/en";
import { bn } from "@/lib/i18n/dictionaries/bn";

type Language = "en" | "bn";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string, variables?: Record<string, any>) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries = { en, bn };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("bn"); // Default to Bangla as per user request context

    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang && (savedLang === "en" || savedLang === "bn")) {
            setLanguageState(savedLang);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    const t = (path: string, variables?: Record<string, any>): any => {
        const keys = path.split(".");
        let result: any = dictionaries[language];

        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path; // Fallback to path if not found
            }
        }

        if (typeof result !== "string") return path;

        if (variables) {
            // Check if any variable is a React element (basic check for object)
            const hasReactElement = Object.values(variables).some(
                (val) => typeof val === "object" && val !== null
            );

            if (hasReactElement) {
                // Split by placeholders
                const parts = result.split(/(\{[^}]+\})/g);
                return parts.map((part: string, index: number) => {
                    if (part.match(/^\{[^}]+\}$/)) {
                        const key = part.slice(1, -1);
                        return (
                            <React.Fragment key={index}>
                                {variables[key] !== undefined ? variables[key] : part}
                            </React.Fragment>
                        );
                    }
                    return <React.Fragment key={index}>{part}</React.Fragment>;
                });
            }

            // Standard string replacement for better performance if no React elements
            Object.entries(variables).forEach(([key, value]) => {
                result = (result as string).replace(`{${key}}`, String(value));
            });
        }

        return result;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
