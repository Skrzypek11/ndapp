"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import {
    ArrowLeft, Clock, User, Shield, Edit, Users,
    Image as ImageIcon, Video, PlayCircle, CheckCircle, XCircle, FileDown
} from "lucide-react"
import { ReportStore, Report, MarkerColor } from "@/lib/store/reports"
import RichTextEditor from "@/components/reports/RichTextEditor"
import TacticalLegend from "@/components/reports/TacticalLegend"
import { useTranslation } from "@/lib/i18n"

const SceneMap = dynamic(() => import("@/components/reports/SceneMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-[10px] text-primary/40 uppercase tracking-widest font-mono border border-border/50 rounded">Loading Satellite Feed...</div>
})

const MOCK_AGENTS_MAP: Record<string, string> = {
    "1": "Agent John Smith",
    "2": "Agent Jane Doe",
    "3": "Sgt. Mike Ross",
    "4": "Det. Sarah Miller",
    "5": "Ofc. Tom Hardy",
}

interface ReportViewProps {
    report: Report
    isReview?: boolean
}

export default function ReportView({ report: initialReport, isReview = false }: ReportViewProps) {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const router = useRouter()
    const [report, setReport] = useState<Report>(initialReport)

    // Review State
    const [rejectionReason, setRejectionReason] = useState("")
    const [action, setAction] = useState<'approve' | 'reject' | null>(null)
    const [isExporting, setIsExporting] = useState(false)

    const isAuthor = session?.user?.id === report.authorId
    const canEdit = isAuthor && (report.status === "DRAFT")
    const canReview = (session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT") && report.status === "SUBMITTED"

    const usedColors = Array.from(new Set(report.map.markers.map((m: any) => m.color))) as MarkerColor[]

    const handleExportPDF = async () => {
        if (report.status !== 'APPROVED') return

        setIsExporting(true)
        try {
            const { PDFExportService } = await import('@/lib/services/PDFExportService')
            const mapEl = document.getElementById(`tactical-map-${report.id}`)
            const service = new PDFExportService(report)
            await service.generate(mapEl || undefined)
        } catch (e) {
            console.error("Export failed", e)
            alert("Export failed. Check console.")
        } finally {
            setIsExporting(false)
        }
    }

    const handleProcessReview = () => {
        if (!session?.user || !action) return
        if (action === 'reject' && !rejectionReason) return alert(dict.reports.review_panel.confirm_error)

        try {
            const updated = ReportStore.reviewAction(
                report.id,
                action,
                session.user.id,
                action === 'reject' ? rejectionReason : undefined
            )
            if (updated) {
                setReport(updated)
                router.push("/dashboard/reports")
            }
        } catch (e) {
            alert("Error processing review")
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'APPROVED': return "bg-primary/20 text-primary border-primary/30"
            case 'PENDING':
            case 'SUBMITTED': return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
            case 'DRAFT': return "bg-muted text-muted-foreground border-border"
            case 'REJECTED': return "bg-destructive/20 text-destructive border-destructive/30"
            case 'UNDER_INVESTIGATION': return "bg-blue-500/20 text-blue-500 border-blue-500/30"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            {/* Header */}
            <header className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-card border border-border p-6 rounded-md shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="text-mono-data text-primary/70">{report.reportNumber}</span>
                            <span className={`px-2 py-0.5 border rounded text-[10px] font-black uppercase tracking-widest ${getStatusStyle(report.status)}`}>
                                {dict.reports.status[report.status.toLowerCase().replace(/_/g, '') as keyof typeof dict.reports.status] || report.status.replace(/_/g, ' ')}
                            </span>
                        </div>
                        <h1 className="text-h2 uppercase group-hover:text-primary transition-colors">{report.title}</h1>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {!isReview && canEdit && (
                        <button
                            onClick={() => router.push(`/dashboard/reports/create?edit=${report.id}`)}
                            className="flex items-center gap-2 bg-muted hover:bg-border text-foreground px-4 py-2 rounded-md text-small font-black uppercase tracking-widest transition-all"
                        >
                            <Edit size={14} />
                            {dict.reports.view.edit}
                        </button>
                    )}
                    {!isReview && canReview && (
                        <button
                            onClick={() => router.push(`/dashboard/reports/${report.id}/review`)}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-small font-black uppercase tracking-widest transition-all shadow-sm"
                        >
                            <Shield size={14} />
                            {dict.reports.view.review}
                        </button>
                    )}
                    <button
                        onClick={handleExportPDF}
                        disabled={report.status !== 'APPROVED' || isExporting}
                        className="flex items-center gap-2 bg-muted hover:bg-border text-foreground px-4 py-2 rounded-md text-small font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed group/export"
                    >
                        {isExporting ? <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /> : <FileDown size={14} />}
                        {isExporting ? dict.reports.view.exporting : dict.reports.view.export}
                    </button>
                </div>
            </header>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-4 rounded-md shadow-sm space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dict.reports.view.metadata.case_number}</label>
                    <div className="text-small font-bold font-mono text-primary">{report.reportNumber}</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-md shadow-sm space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dict.reports.view.metadata.reporting_officer}</label>
                    <div className="flex items-center gap-2 text-small font-bold text-foreground">
                        <User size={14} className="text-primary/60" />
                        {report.authorName}
                    </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-md shadow-sm space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dict.reports.view.metadata.submission_date}</label>
                    <div className="flex items-center gap-2 text-small font-semibold text-foreground">
                        <Clock size={14} className="text-primary/60" />
                        {report.submittedAt ? new Date(report.submittedAt).toLocaleString() : dict.reports.view.metadata.not_submitted}
                    </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-md shadow-sm space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dict.reports.view.metadata.status}</label>
                    <div className="text-small font-black text-primary uppercase tracking-widest">{report.status}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Narrative Section */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                        <div className="bg-muted/30 border-b border-border p-4">
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.reports.view.narrative}</h3>
                        </div>
                        <div className="p-6 prose prose-invert max-w-none">
                            <RichTextEditor content={report.content} onChange={() => { }} editable={false} />
                        </div>
                    </section>

                    {/* Evidence Section */}
                    {(report.evidence?.photo?.length > 0 || report.evidence?.video?.length > 0) && (
                        <section className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                            <div className="bg-muted/30 border-b border-border p-4">
                                <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.reports.view.evidence_locker}</h3>
                            </div>
                            <div className="p-6 space-y-8">
                                {/* Photo Evidence */}
                                {report.evidence.photo.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2 border-b border-border pb-2">
                                            <ImageIcon size={14} /> {dict.reports.view.photos}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {report.evidence.photo.map((photo, index) => {
                                                const capturedBy = photo.capturedBy.type === 'INTERNAL'
                                                    ? (MOCK_AGENTS_MAP[photo.capturedBy.officerId || ''] || 'Unknown Officer')
                                                    : photo.capturedBy.externalDetails?.fullName

                                                return (
                                                    <div key={photo.id} className="flex bg-muted/20 rounded border border-border overflow-hidden p-3 transition-colors hover:bg-muted/30">
                                                        <div className="relative aspect-square w-24 bg-black rounded border border-border overflow-hidden shrink-0 shadow-lg">
                                                            <img src={photo.fileUrl} alt={photo.title} className="w-full h-full object-cover" />
                                                            <div className="absolute top-0 left-0 bg-primary/95 text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-br uppercase tracking-tighter">
                                                                E{index + 1}
                                                            </div>
                                                        </div>
                                                        <div className="ml-4 flex-1 min-w-0 flex flex-col justify-center space-y-1">
                                                            <div className="text-small font-black text-foreground uppercase truncate leading-tight">
                                                                {photo.title}
                                                            </div>
                                                            <div className="text-[9px] text-muted-foreground space-y-0.5 font-mono uppercase tracking-tighter">
                                                                <div>{dict.reports.view.timestamp}: <span className="text-foreground/70">{new Date(photo.timestamp).toLocaleString()}</span></div>
                                                                <div>{dict.reports.view.source}: <span className="text-primary/70">{capturedBy}</span></div>
                                                            </div>
                                                            {photo.linkedMarkerIds?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {photo.linkedMarkerIds.map((mid: string) => (
                                                                        <span key={mid} className="text-[8px] px-1 bg-primary/20 text-primary border border-primary/30 rounded font-mono font-bold">
                                                                            {mid}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Video Evidence */}
                                {report.evidence.video.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black uppercase tracking-widest text-primary/60 flex items-center gap-2 border-b border-border pb-2">
                                            <Video size={14} /> {dict.reports.view.videos}
                                        </h4>
                                        <div className="space-y-3">
                                            {report.evidence.video.map((video, index) => {
                                                const capturedBy = video.capturedBy.type === 'INTERNAL'
                                                    ? (MOCK_AGENTS_MAP[video.capturedBy.officerId || ''] || 'Unknown Officer')
                                                    : video.capturedBy.externalDetails?.fullName

                                                return (
                                                    <div key={video.id} className="bg-muted/20 rounded border border-border p-4 transition-colors hover:bg-muted/30 group">
                                                        <div className="flex gap-4">
                                                            <div className="relative aspect-square w-12 bg-black rounded border border-border flex items-center justify-center shrink-0 shadow-lg">
                                                                <Video size={20} className="text-primary/40 group-hover:text-primary transition-colors" />
                                                                <div className="absolute top-0 left-0 bg-primary/95 text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded-br uppercase tracking-tighter">
                                                                    V{index + 1}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className="text-small font-black text-foreground uppercase truncate">{video.title}</div>
                                                                    <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                                                                        <PlayCircle size={18} />
                                                                    </a>
                                                                </div>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                                                                    <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">
                                                                        {dict.reports.view.timestamp}: <span className="text-foreground/70">{new Date(video.timestamp).toLocaleString()}</span>
                                                                    </div>
                                                                    <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-tighter">
                                                                        {dict.reports.view.source}: <span className="text-foreground/70">{capturedBy}</span>
                                                                    </div>
                                                                </div>
                                                                {video.linkedMarkerIds?.length > 0 && (
                                                                    <div className="flex gap-1 mt-2">
                                                                        {video.linkedMarkerIds.map((mid: string) => (
                                                                            <span key={mid} className="text-[8px] px-1 bg-primary/20 text-primary border border-primary/30 rounded font-mono font-bold">
                                                                                {mid}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Review Decision Panel */}
                    {isReview && (
                        <div className="bg-card border border-primary/40 rounded-md p-6 shadow-xl animate-scale-in relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-1 bg-primary/10 rounded-bl border-b border-l border-primary/20">
                                <Shield size={12} className="text-primary" />
                            </div>
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-primary mb-6">{dict.reports.review_panel.title}</h3>

                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => setAction('approve')}
                                    className={`w-full p-4 border rounded-md transition-all flex items-center justify-between group text-left ${action === 'approve'
                                        ? 'bg-primary/20 border-primary text-primary shadow-inner'
                                        : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/50'
                                        }`}
                                >
                                    <div>
                                        <div className="font-black uppercase tracking-widest text-[10px]">{dict.reports.review_panel.approve.title}</div>
                                        <div className="text-[9px] opacity-70 mt-0.5">{dict.reports.review_panel.approve.description}</div>
                                    </div>
                                    <CheckCircle size={20} className={action === 'approve' ? 'text-primary' : 'text-muted-foreground/30 group-hover:text-primary/50'} />
                                </button>

                                <button
                                    onClick={() => setAction('reject')}
                                    className={`w-full p-4 border rounded-md transition-all flex items-center justify-between group text-left ${action === 'reject'
                                        ? 'bg-destructive/20 border-destructive text-destructive shadow-inner'
                                        : 'bg-muted/30 border-border text-muted-foreground hover:border-destructive/50'
                                        }`}
                                >
                                    <div>
                                        <div className="font-black uppercase tracking-widest text-[10px]">{dict.reports.review_panel.reject.title}</div>
                                        <div className="text-[9px] opacity-70 mt-0.5">{dict.reports.review_panel.reject.description}</div>
                                    </div>
                                    <XCircle size={20} className={action === 'reject' ? 'text-destructive' : 'text-muted-foreground/30 group-hover:text-destructive/50'} />
                                </button>
                            </div>

                            <div className="space-y-2 mb-6 text-left">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">
                                    {dict.reports.review_panel.comments} {action === 'reject' && <span className="text-destructive">*</span>}
                                </label>
                                <textarea
                                    className="w-full bg-muted/30 border border-border rounded-md p-4 text-small text-foreground min-h-[140px] focus:border-primary/50 focus:outline-none transition-colors placeholder:text-muted-foreground/30 resize-none font-medium"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder={dict.reports.review_panel.comments_placeholder}
                                />
                            </div>

                            <button
                                disabled={!action || (action === 'reject' && !rejectionReason)}
                                onClick={handleProcessReview}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-md font-black uppercase tracking-[0.2em] text-[11px] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                            >
                                {dict.reports.review_panel.confirm}
                            </button>
                        </div>
                    )}

                    {/* Map Section */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                        <div className="bg-muted/30 border-b border-border p-4">
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.reports.form.scene_map}</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div id={`tactical-map-${report.id}`} className="h-[400px] rounded border border-border overflow-hidden bg-slate-950 relative shadow-inner">
                                <SceneMap
                                    markers={report.map.markers}
                                    shapes={report.map.shapes}
                                    editable={false}
                                />
                            </div>

                            {/* Tactical Legend */}
                            <div className="p-4 bg-muted/10 rounded border border-border/50">
                                <TacticalLegend
                                    usedColors={usedColors}
                                    legend={report.legend || {}}
                                    readOnly={true}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Asset Registry */}
                    {(report.map.markers.some(m => m.title) || report.map.shapes.some(s => s.title)) && (
                        <section className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                            <div className="bg-muted/30 border-b border-border p-4">
                                <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.reports.view.registry}</h3>
                            </div>
                            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {report.map.markers.filter((m: any) => m.title).map((m: any) => (
                                    <div key={m.id} className="bg-muted/20 border border-border p-3 rounded-md flex items-center gap-4 transition-colors hover:bg-muted/30">
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black font-mono shrink-0 shadow-lg"
                                            style={{ backgroundColor: m.color, color: (m.color === 'white' || m.color === 'yellow') ? 'black' : 'white' }}>
                                            {m.id}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-black text-foreground uppercase truncate tracking-widest">{m.title}</div>
                                            {m.desc && <div className="text-[9px] text-muted-foreground truncate italic">{m.desc}</div>}
                                        </div>
                                    </div>
                                ))}
                                {report.map.shapes.filter((s: any) => s.title).map((s: any) => (
                                    <div key={s.id} className="bg-muted/20 border border-border p-3 rounded-md flex items-center gap-4 transition-colors hover:bg-muted/30">
                                        <div className="w-6 h-6 rounded-sm border-2 flex items-center justify-center text-[10px] font-black font-mono shrink-0 shadow-lg"
                                            style={{ borderColor: s.color, backgroundColor: `${s.color}20`, color: s.color }}>
                                            S
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-black text-foreground uppercase truncate tracking-widest">{s.title}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </div>
    )
}
