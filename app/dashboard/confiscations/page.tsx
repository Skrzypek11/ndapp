"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslation } from "@/lib/i18n"
import { getConfiscations } from "@/app/actions/confiscations"
import { Plus, Search, Scale, FileText } from "lucide-react"

export default function ConfiscationsPage() {
    const { dict } = useTranslation()
    const [confiscations, setConfiscations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getConfiscations().then(data => {
            setConfiscations(data)
            setLoading(false)
        })
    }, [])

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-md shadow-sm">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                        <Scale className="text-primary" size={28} />
                        {dict.confiscations.title}
                    </h1>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        {dict.confiscations.subtitle}
                    </p>
                </div>
                <Link
                    href="/dashboard/confiscations/create"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={16} />
                    {dict.confiscations.create}
                </Link>
            </header>

            {/* List */}
            <div className="bg-card border border-border rounded-md shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/10">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="FILTER REGISTRY..."
                            className="w-full bg-background border border-border rounded pl-9 pr-4 py-2 text-[11px] font-bold uppercase tracking-wider focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-muted-foreground animate-pulse">
                        LOADING REGISTRY DATA...
                    </div>
                ) : confiscations.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Scale size={32} className="opacity-20" />
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest">{dict.confiscations.list.no_records}</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/20 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <th className="px-4 py-3 text-left">{dict.confiscations.list.citizen}</th>
                                    <th className="px-4 py-3 text-left">{dict.confiscations.list.drug}</th>
                                    <th className="px-4 py-3 text-right">{dict.confiscations.list.quantity}</th>
                                    <th className="px-4 py-3 text-left">{dict.confiscations.list.date}</th>
                                    <th className="px-4 py-3 text-left">{dict.confiscations.list.officer}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {confiscations.map((item) => (
                                    <tr key={item.id} className="border-b border-border/50 hover:bg-muted/5 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-foreground text-small">
                                            {item.citizenName || "Unknown"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                                {dict.confiscations.types[item.drugType.toLowerCase()] || item.drugType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-primary font-bold">
                                            {item.quantity} {item.unit}
                                        </td>
                                        <td className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wider">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-black">
                                                    {item.officerName?.charAt(0)}
                                                </div>
                                                <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground group-hover:text-foreground transition-colors">
                                                    {item.officerName}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
