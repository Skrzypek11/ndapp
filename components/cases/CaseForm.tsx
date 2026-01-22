"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Search, Plus, X, FileText, User, Users, Shield, Briefcase, Save, Activity, Info } from "lucide-react"
import { getReports } from "@/app/actions/reports"
import { LinkedReport } from "@/lib/store/cases"
import { useTranslation } from "@/lib/i18n"
import CoAuthorSelect from "@/components/reports/CoAuthorSelect"

interface CaseFormProps {
    initialData?: any
    onSubmit: (data: any) => void
    loading?: boolean
    isAdmin?: boolean
}

export default function CaseForm({ initialData, onSubmit, loading, isAdmin }: CaseFormProps) {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const [title, setTitle] = useState(initialData?.title || "")
    const [description, setDescription] = useState(initialData?.description || "")
    const [participantIds, setParticipantIds] = useState<string[]>(initialData?.participants?.map((p: any) => p.id) || [])
    const [linkedReports, setLinkedReports] = useState<any[]>(initialData?.linkedReports || [])
    const [leadInvestigatorId, setLeadInvestigatorId] = useState(initialData?.leadInvestigatorId || session?.user?.id || "")
    const [leadInvestigatorName, setLeadInvestigatorName] = useState(initialData?.leadInvestigator?.rpName || session?.user?.name || "")

    const [searchTerm, setSearchTerm] = useState("")
    const [availableReports, setAvailableReports] = useState<any[]>([])

    useEffect(() => {
        const loadReports = async () => {
            const data = await getReports()
            setAvailableReports(data)
        }
        loadReports()
    }, [])

    const filteredReports = availableReports.filter(r =>
        (r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.reportNumber.toLowerCase().includes(searchTerm.toLowerCase())) &&
        !linkedReports.some(lr => lr.reportId === r.id)
    )

    const addReport = (report: any) => {
        setLinkedReports([...linkedReports, { reportId: report.id, contextNote: "" }])
    }

    const removeReport = (reportId: string) => {
        setLinkedReports(linkedReports.filter(lr => lr.reportId !== reportId))
    }

    const updateReportNote = (reportId: string, note: string) => {
        setLinkedReports(linkedReports.map(lr =>
            lr.reportId === reportId ? { ...lr, contextNote: note } : lr
        ))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title) return alert(dict.cases.form.placeholders.title)

        onSubmit({
            title,
            description,
            participants: participantIds,
            linkedReports,
            leadInvestigatorId,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-10 pb-12">
            {/* Basic Info Section */}
            <section className="bg-card border border-border rounded-md overflow-hidden shadow-xl group">
                <div className="bg-muted/30 border-b border-border p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                            <Briefcase size={18} />
                        </div>
                        <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">
                            {dict.cases.form.fields.title} & {dict.cases.form.fields.context}
                        </h3>
                    </div>
                </div>
                <div className="p-8 space-y-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1 flex items-center gap-2">
                            <Activity size={12} /> {dict.cases.form.fields.title} *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={dict.cases.form.placeholders.title}
                            className="w-full bg-muted/30 border border-border rounded-lg px-5 py-4 text-small text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-all font-black uppercase tracking-tight shadow-inner"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1 flex items-center gap-2">
                            <Info size={12} /> {dict.cases.form.fields.context}
                        </label>
                        <textarea
                            className="w-full bg-muted/30 border border-border rounded-lg p-5 text-small text-foreground placeholder:text-muted-foreground/20 min-h-[160px] focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-all leading-relaxed font-medium shadow-inner"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={dict.cases.form.placeholders.context}
                        />
                    </div>
                </div>
            </section>

            {/* Personnel Section */}
            <section className="bg-card border border-border rounded-md overflow-hidden shadow-xl">
                <div className="bg-muted/30 border-b border-border p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                        <Users size={18} />
                    </div>
                    <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.cases.view.personnel}</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">{dict.cases.view.metadata.reporting_officer}</label>
                        <div className="flex items-center gap-4 bg-muted/50 p-4 rounded-lg border border-border shadow-inner grayscale opacity-60">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                <User size={18} />
                            </div>
                            <div className="text-small font-black text-foreground uppercase tracking-widest leading-none">{initialData?.reportingOfficerName || session?.user?.name}</div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">{dict.cases.form.fields.lead}</label>
                        {isAdmin ? (
                            <div className="bg-primary/5 border border-dashed border-primary/30 rounded-lg p-4 flex items-center justify-center text-[10px] font-black text-primary italic uppercase tracking-widest text-center h-[58px]">
                                LEAD ASSIGNMENT VIA REVIEW PROTOCOL
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-lg border border-primary/20 shadow-inner">
                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                    <Shield size={18} />
                                </div>
                                <div className="text-small font-black text-foreground uppercase tracking-widest leading-none">{leadInvestigatorName}</div>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">{dict.cases.form.fields.participants}</label>
                        <div className="bg-muted/20 p-6 rounded-lg border border-border/50">
                            <CoAuthorSelect selectedIds={participantIds} onChange={setParticipantIds} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Linked Reports Section */}
            <section className="bg-card border border-border rounded-md overflow-hidden shadow-xl">
                <div className="bg-muted/30 border-b border-border p-5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                        <FileText size={18} />
                    </div>
                    <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.cases.view.field_reports}</h3>
                </div>
                <div className="p-8 space-y-8">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/40 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            className="w-full bg-muted/30 border border-border rounded-lg pl-14 pr-6 py-4 text-small text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/50 focus:bg-muted/50 transition-all font-black uppercase tracking-tight shadow-inner"
                            placeholder="SEARCH REPORTS BY TITLE OR ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 max-h-[400px] overflow-auto animate-in fade-in slide-in-from-top-2 backdrop-blur-xl bg-opacity-95">
                                {filteredReports.length > 0 ? (
                                    filteredReports.map(r => (
                                        <div
                                            key={r.id}
                                            className="p-5 hover:bg-primary/10 cursor-pointer flex justify-between items-center border-b border-border last:border-0 group transition-all"
                                            onClick={() => {
                                                addReport(r)
                                                setSearchTerm("")
                                            }}
                                        >
                                            <div className="space-y-1">
                                                <div className="text-small font-black text-foreground uppercase tracking-tight group-hover:text-primary transition-colors">{r.title}</div>
                                                <div className="text-[10px] text-primary/50 font-mono font-bold tracking-widest">{r.reportNumber}</div>
                                            </div>
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                                <Plus size={18} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-10 text-center text-[11px] text-muted-foreground font-black uppercase tracking-[0.4em] italic opacity-40">No matching intel found</div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="space-y-5">
                        {linkedReports.length === 0 ? (
                            <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed border-border flex flex-col items-center gap-5">
                                <FileText size={48} className="text-muted-foreground/10" strokeWidth={1} />
                                <div className="space-y-1">
                                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.3em] italic">{dict.cases.view.no_reports}</p>
                                    <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-widest">Linked field intelligence will appear here.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                {linkedReports.map((lr) => {
                                    const report = availableReports.find(r => r.id === lr.reportId)
                                    if (!report) return null
                                    return (
                                        <div key={lr.reportId} className="bg-muted/40 border border-border rounded-xl p-6 group transition-all hover:border-primary/40 hover:bg-muted/60 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-[14px] font-black text-foreground uppercase tracking-tight leading-none group-hover:text-primary transition-colors">{report.title}</div>
                                                        <div className="text-[10px] text-primary/60 font-mono font-bold tracking-widest uppercase">{report.reportNumber}</div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeReport(lr.reportId)}
                                                    className="w-10 h-10 rounded-full bg-destructive/10 text-destructive/40 hover:bg-destructive hover:text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-lg active:scale-90"
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            <textarea
                                                className="w-full bg-black/30 border border-border/40 rounded-lg p-5 text-[12px] text-foreground/80 focus:outline-none focus:border-primary/40 h-24 resize-none font-medium leading-relaxed shadow-inner placeholder:text-muted-foreground/20"
                                                placeholder={dict.cases.view.context_note + "..."}
                                                value={lr.contextNote}
                                                onChange={(e) => updateReportNote(lr.reportId, e.target.value)}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer Actions */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-5 py-10 border-t border-border/50">
                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-muted hover:bg-border text-foreground px-8 py-3.5 rounded-md text-small font-black uppercase tracking-widest transition-all border border-border active:scale-95"
                >
                    {dict.common.cancel}
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto group relative flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3.5 rounded-md text-small font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 overflow-hidden"
                >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                        {loading ? <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save size={18} />}
                        {initialData?.id ? dict.cases.form.buttons.update : dict.cases.form.buttons.create}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </button>
            </div>
        </form>
    )
}
