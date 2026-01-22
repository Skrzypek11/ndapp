import React from "react"
import { LucideIcon } from "lucide-react"

interface SectionProps {
    title: string
    icon?: LucideIcon
    children: React.ReactNode
    className?: string
    action?: React.ReactNode
}

export function Section({ title, icon: Icon, children, className = "", action }: SectionProps) {
    return (
        <div className={`rounded-md border border-border bg-card overflow-hidden ${className}`}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 text-primary font-semibold uppercase tracking-wider text-small">
                    {Icon && <Icon size={16} />}
                    {title}
                </div>
                {action}
            </div>
            <div className="p-4 md:p-5">
                {children}
            </div>
        </div>
    )
}
