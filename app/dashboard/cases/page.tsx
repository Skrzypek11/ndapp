"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
    Plus, Folder, Eye, ChevronLeft, ChevronRight,
    Search, Filter, Briefcase, Activity, Shield, Terminal
} from "lucide-react"
import { getCases } from "@/app/actions/cases"
import { useTranslation } from "@/lib/i18n"

export default function CasesListPage() {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const [cases, setCases] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            const data = await getCases()
            setCases(data)
            setLoading(false)
        }
        loadData()
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">{dict.cases.list.retrieving}</p>
            </div>
        </div>
    )

    return (
        <div className="animate-fade-in space-y-6 pb-12">
            {/* Command Header */}
            <header className="page-header bg-card border border-border p-6 rounded-md shadow-xl backdrop-blur-md bg-opacity-95">
                <div className="page-title-group">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/70">
                            {dict.sidebar.operations}
                        </span>
                        <span className="text-border">/</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground">
                            {dict.cases.list.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary/20 rounded flex items-center justify-center text-primary border border-primary/30 shadow-inner group">
                            <Briefcase size={28} className="group-hover:translate-y-[-2px] transition-transform" />
                        </div>
                        <div>
                            <h1 className="page-title !italic !leading-none mb-1">
                                {dict.cases.list.title}
                            </h1>
                            <p className="page-subtitle leading-none flex items-center gap-2">
                                <Terminal size={10} className="text-primary" /> CASE_INTEL_HUB :: TOTAL_ACTIVE: {cases.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        href="/dashboard/cases/create"
                        className="btn-primary"
                    >
                        <Plus size={16} />
                        {dict.cases.list.create}
                    </Link>
                </div>
            </header>

            {/* Assets Table */}
            <div className="card-container">
                <div className="bg-muted/20 border-b border-border p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-primary/60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Operational Intelligence Feed</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                            <input
                                type="text"
                                placeholder="Search Case ID or Title..."
                                className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-2 text-[11px] font-bold text-foreground focus:outline-none focus:border-primary transition-all placeholder:text-muted-foreground/30 uppercase tracking-tight"
                            />
                        </div>
                        <button className="btn-icon">
                            <Filter size={16} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {cases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                            <div className="w-24 h-24 bg-muted/20 rounded-full flex items-center justify-center border border-border shadow-inner">
                                <Folder size={40} className="text-primary/10" strokeWidth={1} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-small font-black uppercase tracking-widest text-foreground">{dict.cases.list.no_cases}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed max-w-xs">{dict.cases.list.no_cases_desc || "Initiate a new operational folder to begin tracking assets and evidence."}</p>
                            </div>
                            <Link
                                href="/dashboard/cases/create"
                                className="text-primary hover:text-primary/80 text-small font-black uppercase tracking-widest underline underline-offset-4"
                            >
                                {dict.cases.list.create_first}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <table className="data-table">
                                <thead className="data-table-thead">
                                    <tr>
                                        <th className="data-table-th">{dict.cases.table.case_id}</th>
                                        <th className="data-table-th">{dict.cases.table.title}</th>
                                        <th className="data-table-th">{dict.cases.table.investigator}</th>
                                        <th className="data-table-th">{dict.cases.table.submitted}</th>
                                        <th className="data-table-th">{dict.cases.table.status}</th>
                                        <th className="data-table-th text-right">{dict.cases.table.actions}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {cases.map((c) => {
                                        const statusKey = c.status.toLowerCase().replace(/_/g, '')
                                        return (
                                            <tr key={c.id} className="data-table-tr group">
                                                <td className="data-table-td">
                                                    <span className="text-mono-data text-primary px-3 py-1 bg-primary/10 rounded border border-primary/20 text-[11px] font-black tracking-tight group-hover:bg-primary/20 transition-all">
                                                        {c.caseId}
                                                    </span>
                                                </td>
                                                <td className="data-table-td">
                                                    <div className="text-small font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">
                                                        {c.title}
                                                    </div>
                                                </td>
                                                <td className="data-table-td">
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={12} className="text-muted-foreground/40" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                                            {c.leadInvestigator?.rpName || 'Unassigned'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="data-table-td">
                                                    <span className="text-[10px] font-black font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                                                        {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "---"}
                                                    </span>
                                                </td>
                                                <td className="data-table-td">
                                                    <span className={`status-badge ${c.status === 'CLOSED' ? 'status-badge-approved' :
                                                        c.status === 'SUBMITTED' || c.status === 'PENDING_CLOSURE' ? 'status-badge-pending' :
                                                            c.status === 'RETURNED' ? 'status-badge-rejected' :
                                                                c.status === 'DRAFT' ? 'status-badge-draft' : 'status-badge-info'
                                                        }`}>
                                                        {dict.cases.status[statusKey as keyof typeof dict.cases.status] || c.status.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="data-table-td text-right">
                                                    <Link
                                                        href={`/dashboard/cases/${c.id}`}
                                                        className="btn-secondary"
                                                    >
                                                        <Eye size={14} />
                                                        {dict.cases.list.view}
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {/* Standardized Pagination */}
                            <div className="bg-muted/10 p-5 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                                    {dict.cases.list.pagination.showing} <span className="text-foreground">1</span> - <span className="text-foreground">{cases.length}</span> {dict.cases.list.pagination.of} <span className="text-foreground">{cases.length}</span> {dict.cases.list.pagination.records}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="btn-icon" disabled>
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded text-[11px] font-black shadow-lg shadow-primary/20">
                                        1
                                    </button>
                                    <button className="btn-icon" disabled>
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Version Signature */}
            <footer className="flex items-center justify-end px-2 opacity-30">
                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                    <Terminal size={10} />
                    MDT_CLIENT_STABLE :: v4.3.0-secure-intel
                </div>
            </footer>
        </div>
    )
}
