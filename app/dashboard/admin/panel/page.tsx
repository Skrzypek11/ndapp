"use client"

import Link from "next/link"
import { useTranslation } from "@/lib/i18n"
import { Scale, FileText, Shield, Monitor, Users } from "lucide-react"

export default function RegistriesHubPage() {
    const { dict } = useTranslation()

    const links = [
        {
            title: dict.admin_panel.hub.users,
            description: dict.admin_panel.hub.users_desc,
            href: "/dashboard/admin/panel/users",
            icon: Users,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        },
        {
            title: dict.admin_panel.hub.drugs,
            description: dict.admin_panel.hub.drugs_desc,
            href: "/dashboard/admin/panel/drugs",
            icon: Scale,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20"
        },
        {
            title: dict.admin_panel.hub.templates,
            description: dict.admin_panel.hub.templates_desc,
            href: "/dashboard/admin/panel/templates",
            icon: FileText,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            title: dict.admin_panel.hub.ranks,
            description: dict.admin_panel.hub.ranks_desc,
            href: "#", // Placeholder
            icon: Shield,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            disabled: true
        }
    ]

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Header */}
            <header className="bg-card border border-border p-6 rounded-md shadow-sm">
                <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                    <Monitor className="text-primary" size={28} />
                    {dict.admin_panel.title}
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                    {dict.admin_panel.subtitle}
                </p>
            </header>

            {/* Hub Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map((link, idx) => {
                    const Icon = link.icon
                    return (
                        <Link
                            key={idx}
                            href={link.href}
                            className={`
                                relative p-6 rounded-md border transition-all duration-300 group
                                ${link.disabled
                                    ? "opacity-60 cursor-not-allowed border-border bg-muted/20"
                                    : "bg-card border-border hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                                }
                            `}
                            onClick={e => link.disabled && e.preventDefault()}
                        >
                            <div className={`
                                w-12 h-12 rounded-lg flex items-center justify-center mb-4
                                ${link.disabled ? "bg-muted text-muted-foreground" : `${link.bg} ${link.color} border ${link.border}`}
                            `}>
                                <Icon size={24} />
                            </div>

                            <h3 className="text-large font-black uppercase tracking-wide text-foreground mb-2 group-hover:text-primary transition-colors">
                                {link.title}
                            </h3>
                            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                                {link.description}
                            </p>

                            {!link.disabled && (
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse" />
                                </div>
                            )}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
