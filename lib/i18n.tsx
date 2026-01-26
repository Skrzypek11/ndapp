"use client"

import React, { createContext, useContext, useState, useEffect } from "react";
import { en, pl, Dictionary } from "./dictionaries";

type Language = "en" | "pl";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    // Default to English, could check browser preference or local storage here
    const [language, setLanguageState] = useState<Language>("pl");

    useEffect(() => {
        const saved = localStorage.getItem("app-language") as Language;
        if (saved && (saved === "en" || saved === "pl")) {
            setLanguageState(saved);
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("app-language", lang);
    };

    const dict = language === "pl" ? pl : en;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, dict }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}
