"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft, Clock, User, Shield, Edit, Users,
    FileText, CheckCircle, Info, ExternalLink, Briefcase, ChevronRight, Terminal, Activity
} from "lucide-react"
import { submitCase, updateCaseStatus } from "@/app/actions/cases"
import { useTranslation } from "@/lib/i18n"

interface CaseViewProps {
    caseData: any
    isAdmin?: boolean
}

export default function CaseView({ caseData: initialCase, isAdmin }: CaseViewProps) {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const router = useRouter()
    const [caseData, setCaseData] = useState<any>(initialCase)
    const [reports, setReports] = useState<any[]>([])

    useEffect(() => {
        // In the new schema, reports are already included in initialCase.linkedReports
        setReports(caseData.linkedReports || [])
    }, [caseData])

    const isReportingOfficer = session?.user?.id === caseData.reportingOfficerId
    const isLeadInvestigator = session?.user?.id === caseData.leadInvestigatorId
    const isUserAdmin = session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"

    const canEdit = (isReportingOfficer && caseData.status === 'DRAFT') ||
        (isLeadInvestigator && (['ASSIGNED', 'IN_PROGRESS', 'RETURNED'].includes(caseData.status)))

    const canSubmit = isReportingOfficer && caseData.status === 'DRAFT'
    const canReview = (isAdmin || isUserAdmin) && caseData.status === "SUBMITTED"
    const canComplete = isLeadInvestigator && (['ASSIGNED', 'IN_PROGRESS', 'RETURNED'].includes(caseData.status))
    const canAdminClose = (isAdmin || isUserAdmin) && caseData.status === "PENDING_CLOSURE"

    const handleUpdateStatus = async (action: 'SUBMIT' | 'COMPLETE' | 'CLOSE' | 'RETURN') => {
        let res;
        if (action === 'SUBMIT') {
            res = await submitCase(caseData.id)
        } else if (action === 'COMPLETE') {
            res = await updateCaseStatus(caseData.id, 'PENDING_CLOSURE')
        } else if (action === 'CLOSE') {
            res = await updateCaseStatus(caseData.id, 'CLOSED')
        } else if (action === 'RETURN') {
            const reason = prompt(dict.reports.review_panel.comments_placeholder)
            if (reason) {
                res = await updateCaseStatus(caseData.id, 'RETURNED', { rejectionReason: reason })
            }
        }

        if (res?.success) {
            router.refresh()
            // We can also fetch the updated case manually if needed, 
            // but router.refresh() handles the server-side state.
            // For client-side immediate update:
            setCaseData({ ...caseData, status: action === 'SUBMIT' ? 'SUBMITTED' : action === 'COMPLETE' ? 'PENDING_CLOSURE' : action === 'CLOSE' ? 'CLOSED' : 'RETURNED' })
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CLOSED': return "bg-primary/20 text-primary border-primary/30"
            case 'DRAFT': return "bg-muted text-muted-foreground border-border"
            case 'SUBMITTED': return "bg-amber-500/20 text-amber-500 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
            case 'ASSIGNED': return "bg-blue-500/20 text-blue-500 border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
            case 'IN_PROGRESS': return "bg-green-500/20 text-green-500 border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)]"
            case 'RETURNED': return "bg-destructive/20 text-destructive border-destructive/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
            case 'PENDING_CLOSURE': return "bg-orange-500/20 text-orange-500 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.1)]"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            {/* Command Header */}
            <header className="bg-card border border-border p-6 rounded-md shadow-xl backdrop-blur-md bg-opacity-95">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-1 hover:text-foreground transition-colors text-[10px] font-black uppercase tracking-widest"
                            >
                                <ArrowLeft size={14} /> {dict.cases.form.back}
                            </button>
                            <span className="text-border">|</span>
                            <span className="text-[11px] uppercase tracking-[0.2em] font-black text-primary/70">
                                {dict.sidebar.operations}
                            </span>
                            <span className="text-border">/</span>
                            <span className="text-[11px] uppercase tracking-[0.2em] font-black text-foreground">
                                {dict.cases.form.title}
                            </span>
                            <span className="text-border">/</span>
                            <span className={`px-2 py-0.5 border rounded-[2px] text-[8px] font-black uppercase tracking-widest ${getStatusStyle(caseData.status)}`}>
                                {caseData.status.replace(/_/g, ' ')}
                            </span>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-primary/20 rounded flex items-center justify-center text-primary border border-primary/30 shadow-inner group">
                                <Briefcase size={28} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <h1 className="text-h1 text-foreground leading-none mb-1 uppercase font-black italic tracking-tight">
                                    {caseData.title}
                                </h1>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-mono leading-none flex items-center gap-2">
                                    <Terminal size={11} className="text-primary" /> CASE_RECORD :: <span className="text-foreground tracking-tighter">{caseData.caseId}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {canEdit && caseData.status !== 'CLOSED' && (
                            <button
                                onClick={() => router.push(`/dashboard/cases/create?edit=${caseData.id}`)}
                                className="flex items-center gap-2 bg-muted hover:bg-border text-foreground px-5 py-2.5 rounded-md text-small font-black uppercase tracking-widest transition-all border border-border shadow-sm active:scale-95"
                            >
                                <Edit size={16} />
                                {dict.cases.view.edit}
                            </button>
                        )}
                        {canSubmit && (
                            <button
                                onClick={() => handleUpdateStatus('SUBMIT')}
                                className="group relative flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md text-small font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 overflow-hidden active:scale-95"
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    {dict.cases.view.submit}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </button>
                        )}
                        {canReview && (
                            <button
                                onClick={() => router.push(`/dashboard/cases/${caseData.id}/review`)}
                                className="group relative flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md text-small font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 overflow-hidden active:scale-95"
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    <Shield size={16} />
                                    {dict.cases.view.review}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </button>
                        )}
                        {canComplete && (
                            <button
                                onClick={() => handleUpdateStatus('COMPLETE')}
                                className="group relative flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md text-small font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 overflow-hidden active:scale-95"
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    <CheckCircle size={16} />
                                    {dict.cases.view.complete}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </button>
                        )}
                        {canAdminClose && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleUpdateStatus('RETURN')}
                                    className="flex items-center gap-2 bg-muted hover:bg-border text-foreground px-4 py-2.5 rounded-md text-small font-black uppercase tracking-widest transition-all border border-border active:scale-95"
                                >
                                    <ArrowLeft size={16} />
                                    {dict.cases.view.return}
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus('CLOSE')}
                                    className="group relative flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-md text-small font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 overflow-hidden active:scale-95"
                                >
                                    <div className="relative z-10 flex items-center gap-2">
                                        <CheckCircle size={16} />
                                        {dict.cases.view.close}
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Metadata Tickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: dict.cases.view.metadata.case_id, value: caseData.caseId, icon: Briefcase, mono: true },
                    { label: dict.cases.view.metadata.lead_investigator, value: caseData.leadInvestigator?.rpName, icon: Shield },
                    { label: dict.cases.view.metadata.reporting_officer, value: caseData.reportingOfficer?.rpName, icon: User },
                    { label: dict.cases.view.metadata.initialization_date, value: new Date(caseData.createdAt).toLocaleDateString(), icon: Clock }
                ].map((item, i) => (
                    <div key={i} className="bg-card border border-border p-5 rounded-md shadow-xl space-y-3 group hover:border-primary/40 transition-all hover:translate-y-[-2px]">
                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1 flex items-center gap-2">
                            <item.icon size={15} className="text-primary/40 group-hover:text-primary transition-colors" />
                            {item.label}
                        </label>
                        <div className={`text-[13px] font-black uppercase tracking-tight text-foreground px-1 ${item.mono ? "font-mono text-primary/90" : ""}`}>
                            {item.value}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Intel */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Mission Context */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-xl relative group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
                        <div className="bg-muted/30 border-b border-border p-5 flex items-center gap-3">
                            <Info size={18} className="text-primary" />
                            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-foreground italic">{dict.cases.view.context}</h3>
                        </div>
                        <div className="p-10 text-[15px] leading-relaxed text-foreground/90 min-h-[200px] font-medium whitespace-pre-wrap">
                            {caseData.description || dict.cases.view.context_placeholder}
                        </div>
                    </section>

                    {/* Linked Field Intelligence */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-xl">
                        <div className="bg-muted/30 border-b border-border p-5 flex items-center gap-3">
                            <FileText size={18} className="text-primary" />
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.cases.view.field_reports}</h3>
                        </div>
                        <div className="p-6 space-y-6">
                            {reports.length === 0 ? (
                                <div className="text-center py-24 bg-muted/10 border-2 border-dashed border-border rounded-xl flex flex-col items-center gap-6">
                                    <FileText size={56} className="text-muted-foreground/10" strokeWidth={1} />
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 italic">
                                        {dict.cases.view.no_reports}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-5">
                                    {reports.map((report: any) => {
                                        const linkedInfo = caseData.linkedReports.find((lr: any) => lr.reportId === report.id)
                                        return (
                                            <div key={report.id} className="bg-muted/30 border border-border rounded-xl overflow-hidden flex flex-col transition-all hover:border-primary/40 hover:bg-muted/50 group relative">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary/40 transition-colors"></div>
                                                <div className="p-6 flex justify-between items-center">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                                            <FileText size={24} />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <div className="text-[16px] font-black text-foreground uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{report.title}</div>
                                                            <div className="text-[10px] text-primary/70 font-mono font-bold tracking-widest uppercase flex items-center gap-2">
                                                                {report.reportNumber}
                                                                <span className="text-muted-foreground/30">•</span>
                                                                <span className="text-muted-foreground">{report.author?.rpName || 'Unknown'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link
                                                        href={`/dashboard/reports/${report.id}`}
                                                        target="_blank"
                                                        className="h-10 px-5 bg-muted hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] border border-border rounded-md shadow-sm active:scale-95"
                                                    >
                                                        {dict.cases.view.open_report} <ExternalLink size={14} />
                                                    </Link>
                                                </div>
                                                {linkedInfo?.contextNote && (
                                                    <div className="px-6 pb-6 pt-0">
                                                        <div className="bg-black/30 p-5 rounded-lg border border-border/40 italic relative overflow-hidden shadow-inner">
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                                                            <div className="text-[11px] uppercase text-primary font-black mb-3 flex items-center gap-2 tracking-[0.2em]">
                                                                <Activity size={12} /> {dict.cases.view.context_note}
                                                            </div>
                                                            <div className="text-[13px] text-foreground/80 leading-relaxed font-semibold">
                                                                "{linkedInfo.contextNote}"
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Tactical Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Unit Personnel */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-xl">
                        <div className="bg-muted/30 border-b border-border p-5 flex items-center gap-3">
                            <Users size={18} className="text-primary" />
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.cases.view.personnel}</h3>
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">{dict.cases.view.lead}</label>
                                <div className="flex items-center gap-4 bg-primary/5 p-5 rounded-lg border border-primary/20 shadow-inner group hover:border-primary/40 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-lg group-hover:scale-110 transition-transform">
                                        <Shield size={22} />
                                    </div>
                                    <div className="text-small font-black text-foreground uppercase tracking-widest">{caseData.leadInvestigator?.rpName || 'Unassigned'}</div>
                                </div>
                            </div>

                            {caseData.participants?.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-border/50">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 px-1">{dict.cases.view.participants}</label>
                                    <div className="grid grid-cols-1 gap-3">
                                        {caseData.participants.map((p: any) => (
                                            <div key={p.id} className="flex items-center gap-4 bg-muted/40 p-4 rounded-lg border border-border group hover:border-primary/20 transition-all hover:translate-x-1">
                                                <div className="w-10 h-10 rounded bg-muted/60 flex items-center justify-center text-muted-foreground border border-border shadow-sm group-hover:text-primary transition-colors">
                                                    <Users size={16} />
                                                </div>
                                                <div className="text-[10px] text-foreground font-black uppercase font-mono tracking-[0.1em]">{p.rpName}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Operational Timeline */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-xl">
                        <div className="bg-muted/30 border-b border-border p-5 flex items-center gap-3">
                            <Clock size={18} className="text-primary" />
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.cases.view.timeline}</h3>
                        </div>
                        <div className="p-10">
                            <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                                <div className="relative group">
                                    <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-background border-2 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] z-10 p-[3.5px]">
                                        <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                    <div className="text-[12px] font-black text-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{dict.cases.view.initialized}</div>
                                    <div className="text-[10px] text-muted-foreground font-mono font-black mt-2 uppercase tracking-tight">{new Date(caseData.createdAt).toLocaleString()}</div>
                                </div>

                                {caseData.submittedAt && (
                                    <div className="relative group">
                                        <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-background border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)] z-10 p-[3.5px]">
                                            <div className="w-full h-full bg-blue-500 rounded-full"></div>
                                        </div>
                                        <div className="text-[12px] font-black text-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{dict.cases.view.submitted}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono font-black mt-2 uppercase tracking-tight">{new Date(caseData.submittedAt).toLocaleString()}</div>
                                    </div>
                                )}

                                {caseData.approvedAt && (
                                    <div className="relative group">
                                        <div className="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-background border-2 border-primary shadow-[0_0_15px_rgba(var(--primary),0.4)] z-10 p-[3.5px]">
                                            <div className="w-full h-full bg-primary rounded-full"></div>
                                        </div>
                                        <div className="text-[12px] font-black text-foreground uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{dict.cases.view.approved}</div>
                                        <div className="text-[10px] text-muted-foreground font-mono font-black mt-2 uppercase tracking-tight">{new Date(caseData.approvedAt).toLocaleString()}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
