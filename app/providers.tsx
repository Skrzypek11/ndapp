"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { LanguageProvider } from "@/lib/i18n"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <LanguageProvider>
                <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
                    {children}
                </ThemeProvider>
            </LanguageProvider>
        </SessionProvider>
    )
}
