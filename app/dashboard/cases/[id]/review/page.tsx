"use client"

import { use, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, CheckCircle, AlertTriangle, ArrowLeft, Activity, Lock, Terminal } from "lucide-react"
import { Case, CaseStore } from "@/lib/store/cases"
import CaseView from "@/components/cases/CaseView"
import { useTranslation } from "@/lib/i18n"

const MOCK_AGENTS = [
    { id: "1", name: "Agent John Smith" },
    { id: "2", name: "Agent Jane Doe" },
    { id: "3", name: "Sgt. Mike Ross" },
    { id: "4", name: "Det. Sarah Miller" },
    { id: "5", name: "Ofc. Tom Hardy" },
]

export default function ReviewCasePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const router = useRouter()
    const [caseData, setCaseData] = useState<Case | null>(null)
    const [leadInvestigatorId, setLeadInvestigatorId] = useState("")

    useEffect(() => {
        if (id) {
            const data = CaseStore.getById(id)
            if (data) {
                setCaseData(data)
                setLeadInvestigatorId(data.leadInvestigatorId)
            }
        }
    }, [id])

    if (!caseData) return (
        <div className="p-8 flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">{dict.cases.review.accessing}</p>
            </div>
        </div>
    )

    const isAdmin = session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"
    if (!isAdmin) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive border border-destructive/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <Lock size={40} />
                </div>
                <div className="space-y-1">
                    <h2 className="text-destructive font-black text-2xl uppercase tracking-tighter">{dict.cases.review.access_denied}</h2>
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">{dict.cases.review.unauthorized}</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-6 flex items-center gap-2 bg-muted hover:bg-border px-6 py-2 rounded text-small font-black uppercase tracking-widest transition-all border border-border"
                >
                    <ArrowLeft size={16} /> {dict.cases.view.back}
                </button>
            </div>
        )
    }

    const handleApprove = () => {
        const lead = MOCK_AGENTS.find(a => a.id === leadInvestigatorId)
        if (!lead) return alert(dict.cases.review.alert_valid_lead)

        CaseStore.assign(caseData.id, lead.id, lead.name)
        router.push("/dashboard/cases")
    }

    const handleReturn = () => {
        const reason = prompt(dict.reports.review_panel.comments_placeholder)
        if (reason) {
            CaseStore.returnForRevisions(caseData.id, reason)
            router.push("/dashboard/cases")
        }
    }

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            {/* Protocol Control Center */}
            <div className="bg-card border border-primary/40 rounded-md overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-2 bg-primary/10 rounded-bl border-b border-l border-primary/20 flex items-center gap-2">
                    <Terminal size={12} className="text-primary animate-pulse" />
                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">Secure Admin Node Alpha</span>
                </div>

                <div className="bg-primary/5 border-b border-primary/20 p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-primary/20 rounded flex items-center justify-center text-primary border border-primary/30 shadow-inner scale-110">
                            <Shield size={32} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-h2 text-foreground uppercase tracking-tight font-black italic">{dict.cases.review.title}</h2>
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-2 py-0.5 bg-primary/20 border border-primary/30 text-primary rounded-[2px] text-[9px] font-black uppercase tracking-widest">
                                    {caseData.status}
                                </span>
                                <span className="text-muted-foreground/40 font-mono text-[9px]">/</span>
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest flex items-center gap-2">
                                    {dict.cases.review.reviewer}: <span className="text-foreground border-b border-primary/30">{session?.user?.name}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-6 bg-black/20 p-5 rounded-md border border-primary/10">
                        <div className="w-full sm:w-auto flex flex-col gap-2">
                            <label className="text-[10px] font-black text-primary/70 uppercase tracking-widest px-1 flex items-center gap-2">
                                <Activity size={12} /> {dict.cases.review.assign_lead}
                            </label>
                            <select
                                className="bg-background border border-primary/30 rounded-md px-5 py-3 text-small text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black uppercase tracking-widest min-w-[280px] shadow-inner cursor-pointer"
                                value={leadInvestigatorId}
                                onChange={(e) => setLeadInvestigatorId(e.target.value)}
                            >
                                <option value="" className="bg-card">{dict.cases.review.select_agent}</option>
                                {MOCK_AGENTS.map(agent => (
                                    <option key={agent.id} value={agent.id} className="bg-card">{agent.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto mt-auto sm:mt-6 lg:mt-6 xl:mt-0">
                            <button
                                onClick={handleReturn}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-muted hover:bg-border text-foreground px-6 py-3.5 rounded-md text-small font-black uppercase tracking-widest transition-all border border-border shadow-sm active:scale-95"
                            >
                                <AlertTriangle size={16} className="text-destructive/70" />
                                {dict.cases.review.return}
                            </button>
                            <button
                                disabled={!leadInvestigatorId}
                                onClick={handleApprove}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed text-primary-foreground px-8 py-3.5 rounded-md text-small font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/30 active:scale-95"
                            >
                                <CheckCircle size={18} />
                                {dict.cases.review.authorize}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secure Dossier Context */}
                <div className="bg-muted/10 p-5 border-t border-border flex flex-col md:flex-row md:items-center justify-between px-8 gap-4">
                    <div className="flex flex-wrap items-center gap-8">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Operational ID:</span>
                            <span className="text-mono-data text-primary text-[11px] font-black">{caseData.caseId}</span>
                        </div>
                        <div className="hidden md:block w-px h-4 bg-border"></div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">Initiator:</span>
                            <span className="text-small font-black text-foreground uppercase tracking-tight">{caseData.reportingOfficerName}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <span className="text-[9px] font-black uppercase text-primary/40 animate-pulse tracking-[0.3em] flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping"></div>
                            ENCRYPTED CHANNEL :: DATA STREAM STABLE
                        </span>
                        <button
                            onClick={() => router.back()}
                            className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 bg-muted/20 hover:bg-muted/40 px-3 py-1.5 rounded border border-border/50"
                        >
                            <ArrowLeft size={14} /> {dict.cases.view.back}
                        </button>
                    </div>
                </div>
            </div>

            {/* Injected Dossier View */}
            <div className="relative group">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-background via-background/40 to-transparent z-10 pointer-events-none rounded-t-md"></div>
                <div className="opacity-90 grayscale-[20%] group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 bg-background rounded-md border border-border shadow-2xl relative overflow-hidden pointer-events-auto">
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/20 z-20"></div>
                    <CaseView caseData={caseData} isAdmin={true} />
                </div>
            </div>
        </div>
    )
}
