"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const { dict } = useTranslation()
    const [mounted, setMounted] = useState(false)

    // Avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    const options = [
        { id: "light", icon: Sun, label: dict.settings.appearance.light },
        { id: "dark", icon: Moon, label: dict.settings.appearance.dark },
        { id: "system", icon: Monitor, label: dict.settings.appearance.system },
    ]

    return (
        <div className="flex bg-muted/30 border border-border p-1 rounded-lg w-fit">
            {options.map((opt) => {
                const Icon = opt.icon
                const isActive = theme === opt.id
                return (
                    <button
                        key={opt.id}
                        onClick={() => setTheme(opt.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 text-small font-black uppercase tracking-widest ${isActive
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        <Icon size={14} />
                        {opt.label}
                    </button>
                )
            })}
        </div>
    )
}
