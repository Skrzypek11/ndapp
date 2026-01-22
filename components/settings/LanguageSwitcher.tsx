"use client"

import { useTranslation } from "@/lib/i18n"

export default function LanguageSwitcher() {
    const { language, setLanguage, dict } = useTranslation()

    return (
        <div className="flex bg-muted/30 border border-border p-1 rounded-lg w-fit">
            <button
                onClick={() => setLanguage("en")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-small font-black uppercase tracking-widest ${language === "en"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <span className="text-base leading-none">🇺🇸</span>
                {dict.settings.language.english}
            </button>
            <button
                onClick={() => setLanguage("pl")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-small font-black uppercase tracking-widest ${language === "pl"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
            >
                <span className="text-base leading-none">🇵🇱</span>
                {dict.settings.language.polish}
            </button>
        </div>
    )
}
