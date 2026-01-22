"use client"

import { useState, useEffect, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Save, Send, ArrowLeft, FileText, Map as MapIcon, Paperclip, Users, User, ChevronLeft } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { createReport, updateReport, submitReport, getReportById } from "@/app/actions/reports"
import { Marker, MarkerColor, PhotoEvidence, VideoEvidence, Shape } from "@/lib/store/reports"
import RichTextEditor from "@/components/reports/RichTextEditor"
import CoAuthorSelect from "@/components/reports/CoAuthorSelect"
import EvidenceManager from "@/components/reports/EvidenceManager"
import TacticalLegend from "@/components/reports/TacticalLegend"

const SceneMap = dynamic(() => import("@/components/reports/SceneMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-[10px] text-primary/40 uppercase tracking-widest font-mono border border-border/50 rounded">Establishing Tactical Link...</div>
})

import MarkerEditModal from "@/components/reports/MarkerEditModal"
import ShapeEditModal from "@/components/reports/ShapeEditModal"

export default function CreateReportPage() {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('edit')

    const [loading, setLoading] = useState(false)
    const [isEdit, setIsEdit] = useState(false)

    // Form State
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("<p>Incident details...</p>")
    const [markers, setMarkers] = useState<Marker[]>([])
    const [shapes, setShapes] = useState<Shape[]>([])
    const [legend, setLegend] = useState<Record<MarkerColor, string>>({
        red: '', blue: '', yellow: '', green: '', orange: '', purple: '', black: '', white: ''
    })
    const [coAuthors, setCoAuthors] = useState<string[]>([])
    const [photos, setPhotos] = useState<PhotoEvidence[]>([])
    const [videos, setVideos] = useState<VideoEvidence[]>([])

    // Modal State
    const [editingMarker, setEditingMarker] = useState<Marker | null>(null)
    const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false)
    const [editingShape, setEditingShape] = useState<Shape | null>(null)
    const [isShapeModalOpen, setIsShapeModalOpen] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            if (editId) {
                const report = await getReportById(editId)
                if (report) {
                    setIsEdit(true)
                    setTitle(report.title)
                    setContent(report.content || "")
                    const mapData = report.mapData as any || { markers: [], shapes: [] }
                    setMarkers(mapData.markers || [])
                    setShapes(mapData.shapes || [])
                    setLegend(report.legend as any || {
                        red: '', blue: '', yellow: '', green: '', orange: '', purple: '', black: '', white: ''
                    })
                    setCoAuthors((report.coAuthors as any[]).map(ca => ca.id))
                    const evidence = report.evidence as any || { photo: [], video: [] }
                    setPhotos(evidence.photo || [])
                    setVideos(evidence.video || [])
                }
            }
        }
        loadData()
    }, [editId])

    const handleMarkerAdd = (x: number, y: number) => {
        setMarkers(prev => {
            const nextId = prev.length > 0
                ? `M${parseInt(prev[prev.length - 1].id.slice(1)) + 1}`
                : 'M1'

            const newMarker: Marker = {
                id: nextId,
                x: Math.round(x),
                y: Math.round(y),
                color: 'red'
            }

            setTimeout(() => {
                setEditingMarker(newMarker)
                setIsMarkerModalOpen(true)
            }, 0)

            return [...prev, newMarker]
        })
    }

    const handleMarkerUpdate = (updates: Partial<Marker>) => {
        if (!editingMarker) return
        setMarkers(prev => prev.map(m => m.id === editingMarker.id ? { ...m, ...updates } : m))
        setEditingMarker(prev => prev ? { ...prev, ...updates } : null)
    }

    const handleMarkerDelete = (id: string) => {
        setMarkers(prev => prev.filter(m => m.id !== id))
    }

    const handleShapeAdd = (shapeData: Omit<Shape, 'id'>) => {
        setShapes(prev => {
            const nextId = prev.length > 0
                ? `S${parseInt(prev[prev.length - 1].id.slice(1)) + 1}`
                : 'S1'

            const newShape: Shape = {
                ...shapeData,
                id: nextId
            }

            setTimeout(() => {
                setEditingShape(newShape)
                setIsShapeModalOpen(true)
            }, 0)

            return [...prev, newShape]
        })
    }

    const handleShapeUpdate = (updates: Partial<Shape>) => {
        if (!editingShape) return
        setShapes(prev => prev.map(s => s.id === editingShape.id ? { ...s, ...updates } : s))
        setEditingShape(prev => prev ? { ...prev, ...updates } : null)
    }

    const handleShapeDelete = (id: string) => {
        setShapes(prev => prev.filter(s => s.id !== id))
    }

    const handleLegendChange = (color: MarkerColor, description: string) => {
        setLegend(prev => ({ ...prev, [color]: description }))
    }

    const usedColors = Array.from(new Set(markers.map(m => m.color))) as MarkerColor[]

    const handleSave = async (submit: boolean = false) => {
        if (!session?.user) return
        if (!title) return alert("Title is required")

        setLoading(true)

        try {
            const reportData = {
                title,
                content,
                mapData: {
                    markers: markers,
                    shapes: shapes
                },
                legend: legend,
                evidence: {
                    photo: photos,
                    video: videos
                },
            }

            let res;
            if (isEdit && editId) {
                res = await updateReport(editId, reportData)
                if (res.success && submit) {
                    await submitReport(editId)
                }
            } else {
                res = await createReport(reportData)
                if (res.success && submit && res.report) {
                    await submitReport(res.report.id)
                }
            }

            router.push("/dashboard/reports")
        } catch (e) {
            console.error(e)
            alert("Failed to save report")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in space-y-8 pb-20">
            {/* Header / Command Bar */}
            <header className="sticky top-0 z-50 flex flex-col md:flex-row items-start md:items-center justify-between bg-card border border-border p-6 rounded-md shadow-xl backdrop-blur-md bg-opacity-95 gap-4">
                <div className="flex-1 max-w-2xl space-y-3">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-1 hover:text-foreground transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            <ChevronLeft size={14} /> {dict.reports.form.back}
                        </button>
                        <span className="text-border">|</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/70">
                            {isEdit ? dict.reports.form.edit_subtitle : dict.reports.form.subtitle}
                        </span>
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={dict.reports.form.placeholder_title}
                        className="w-full bg-transparent text-2xl md:text-3xl font-black uppercase text-foreground placeholder:text-muted-foreground/20 focus:outline-none tracking-tight font-sans selection:bg-primary/30"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col text-right mr-4 border-r border-border pr-4 gap-0.5">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {dict.reports.form.draft_id}: <span className="text-primary">{isEdit ? editId?.slice(0, 8) : dict.reports.form.pending}</span>
                        </span>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {dict.reports.form.officer}: <span className="text-foreground">{session?.user?.name}</span>
                        </span>
                    </div>

                    <button
                        onClick={() => handleSave(false)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-muted hover:bg-border text-foreground px-4 py-2 rounded-md text-small font-black uppercase tracking-widest transition-all border border-border disabled:opacity-50"
                    >
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-border border-t-foreground rounded-full animate-spin" /> : <Save size={14} />}
                        {dict.reports.form.save_draft}
                    </button>

                    <button
                        onClick={() => handleSave(true)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md text-small font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading ? <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Send size={14} />}
                        {dict.reports.form.submit}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Modals */}
                <MarkerEditModal
                    isOpen={isMarkerModalOpen}
                    onClose={() => setIsMarkerModalOpen(false)}
                    marker={editingMarker}
                    onUpdate={handleMarkerUpdate}
                    onDelete={handleMarkerDelete}
                />

                <ShapeEditModal
                    isOpen={isShapeModalOpen}
                    onClose={() => setIsShapeModalOpen(false)}
                    shape={editingShape}
                    onUpdate={handleShapeUpdate}
                    onDelete={handleShapeDelete}
                />

                {/* Left Column: Personnel & Narrative */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Personnel Section */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                        <div className="bg-muted/30 border-b border-border p-4 flex items-center gap-2">
                            <Users size={16} className="text-primary" />
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.reports.form.personnel}</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">{dict.reports.form.reporting_officer}</label>
                                <div className="flex items-center gap-3 bg-primary/5 p-3 rounded border border-primary/20">
                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                        <User size={14} />
                                    </div>
                                    <div className="text-small font-bold text-foreground font-mono tracking-wider">{session?.user?.name || "Unknown Agent"}</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">{dict.reports.form.co_authors}</label>
                                <CoAuthorSelect selectedIds={coAuthors} onChange={setCoAuthors} />
                            </div>
                        </div>
                    </section>

                    {/* Narrative Section */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-sm min-h-[500px] flex flex-col">
                        <div className="bg-muted/30 border-b border-border p-4 flex items-center gap-2">
                            <FileText size={16} className="text-primary" />
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.reports.form.narrative}</h3>
                        </div>
                        <div className="flex-1 p-0 relative">
                            <RichTextEditor content={content} onChange={setContent} />
                        </div>
                    </section>
                </div>

                {/* Right Column: Map & Evidence */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Tactical Map */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                        <div className="bg-muted/30 border-b border-border p-4 flex items-center gap-2">
                            <MapIcon size={16} className="text-primary" />
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.reports.form.map_title}</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="h-[450px] w-full rounded border border-border overflow-hidden relative group shadow-inner bg-slate-900/50">
                                <SceneMap
                                    markers={markers}
                                    shapes={shapes}
                                    onMarkerAdd={handleMarkerAdd}
                                    onMarkerClick={(m) => {
                                        setEditingMarker(m)
                                        setIsMarkerModalOpen(true)
                                    }}
                                    onShapeAdd={handleShapeAdd}
                                    onShapeClick={(s) => {
                                        setEditingShape(s)
                                        setIsShapeModalOpen(true)
                                    }}
                                />
                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none transition-opacity opacity-100 group-hover:opacity-0">
                                    <p className="text-[9px] text-white/50 text-center uppercase tracking-widest font-bold">Intelligent Tactical Overlay</p>
                                </div>
                            </div>

                            <div className="bg-muted/10 p-4 rounded-md border border-border/50 space-y-4">
                                <TacticalLegend
                                    usedColors={usedColors}
                                    legend={legend}
                                    onChange={handleLegendChange}
                                />
                                {markers.length === 0 && (
                                    <div className="text-[10px] text-muted-foreground/50 italic text-center py-4 border border-dashed border-border rounded-md bg-black/10">
                                        {dict.reports.form.map_hint}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Evidence Locker */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-sm">
                        <div className="bg-muted/30 border-b border-border p-4 flex items-center gap-2">
                            <Paperclip size={16} className="text-primary" />
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.reports.form.evidence}</h3>
                        </div>
                        <div className="p-4">
                            <EvidenceManager
                                photos={photos}
                                videos={videos}
                                markers={markers}
                                onPhotosChange={setPhotos}
                                onVideosChange={setVideos}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    )
}
