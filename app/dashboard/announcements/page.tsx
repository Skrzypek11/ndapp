"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useTranslation } from "@/lib/i18n"
import { getAnnouncements, markAsRead, createAnnouncement, deleteAnnouncement, getReadReceipts } from "@/app/actions/announcements"
import {
    Bell, Plus, Shield, Clock, CheckCircle2,
    AlertTriangle, Info, Zap, X, Send,
    Eye, User, Check, Trash2, Users
} from "lucide-react"

export default function AnnouncementsPage() {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [filter, setFilter] = useState('all') // all, unread, read
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [readers, setReaders] = useState<any[]>([])
    const [loadingReaders, setLoadingReaders] = useState(false)
    const [showReadersList, setShowReadersList] = useState(false)

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true)
        const data = await getAnnouncements()
        setAnnouncements(data)
        setLoading(false)
    }, [])

    useEffect(() => {
        fetchAnnouncements()
    }, [fetchAnnouncements])

    const handleMarkAsRead = async (id: string) => {
        const res = await markAsRead(id)
        if (res.success) {
            fetchAnnouncements()
            if (selectedAnnouncement?.id === id) {
                setSelectedAnnouncement({ ...selectedAnnouncement, isRead: true })
            }
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm(dict.announcements?.delete_confirm || "Are you sure?")) return

        const res = await deleteAnnouncement(id)
        if (res.success) {
            setSelectedAnnouncement(null)
            fetchAnnouncements()
        } else {
            alert(res.error)
        }
    }

    const handleFetchReaders = async (id: string) => {
        setLoadingReaders(true)
        const data = await getReadReceipts(id)
        setReaders(data)
        setLoadingReaders(false)
    }

    const filteredAnnouncements = announcements.filter(a => {
        if (filter === 'unread') return !a.isRead
        if (filter === 'read') return a.isRead
        return true
    })

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'critical': return { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive', icon: AlertTriangle }
            case 'high': return { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-500', icon: Zap }
            default: return { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary', icon: Info }
        }
    }

    const isAdmin = session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"

    return (
        <>
            <div className="animate-fade-in space-y-6 pb-20">
                {/* Header */}
                <header className="page-header border border-border p-8 rounded-md bg-card shadow-2xl relative overflow-hidden group">
                    <div className="page-title-group relative z-10">
                        <h1 className="page-title !italic !leading-none mb-1">
                            {dict.announcements.title}
                        </h1>
                        <p className="page-subtitle flex items-center gap-2">
                            <Bell size={14} className="text-primary" />
                            {dict.announcements.subtitle}
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="btn-primary relative z-10"
                        >
                            <Plus size={16} />
                            {dict.announcements.create}
                        </button>
                    )}

                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Bell size={140} className="text-primary rotate-12" />
                    </div>
                </header>

                {/* Filters */}
                <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-md border border-border/40 w-fit">
                    {['all', 'unread', 'read'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${filter === f
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {dict.announcements.filter[f as keyof typeof dict.announcements.filter]}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="grid grid-cols-1 gap-4">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-32 bg-card/50 border border-border/50 rounded animate-pulse" />
                        ))
                    ) : filteredAnnouncements.length > 0 ? (
                        filteredAnnouncements.map((a) => {
                            const styles = getPriorityStyles(a.priority)
                            const Icon = styles.icon
                            return (
                                <div
                                    key={a.id}
                                    onClick={() => setSelectedAnnouncement(a)}
                                    className={`card-container p-6 hover:border-primary/40 transition-all cursor-pointer shadow-xl overflow-hidden ${a.isPinned ? 'ring-1 ring-primary/20 shadow-primary/5' : ''}`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                        <div className="flex items-start gap-6">
                                            <div className={`shrink-0 w-12 h-12 rounded flex items-center justify-center ${styles.bg} ${styles.text} border ${styles.border} shadow-inner`}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors leading-none italic">{a.title}</h3>
                                                    {a.isPinned && (
                                                        <span className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-full animate-pulse">
                                                            <Zap size={10} /> PINNED
                                                        </span>
                                                    )}
                                                    <span className={`status-badge ${a.priority === 'critical' ? 'status-badge-rejected' :
                                                        a.priority === 'high' ? 'status-badge-pending' : 'status-badge-approved'
                                                        }`}>
                                                        {dict.announcements.priority[a.priority as keyof typeof dict.announcements.priority]}
                                                    </span>
                                                </div>
                                                <p className="text-[12px] text-muted-foreground/80 line-clamp-1 max-w-3xl font-medium tracking-wide">
                                                    {a.body}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 self-end md:self-auto shrink-0 border-l border-border/20 pl-8 h-full">
                                            <div className="space-y-1.5 text-right hidden sm:block">
                                                <div className="text-[9px] uppercase text-muted-foreground font-black tracking-widest opacity-40">Status</div>
                                                <div className={`text-[10px] font-black uppercase flex items-center gap-2 justify-end ${a.isRead ? 'text-green-500' : 'text-primary'}`}>
                                                    {a.isRead ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                    {a.isRead ? dict.announcements.status.read : dict.announcements.status.unread}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5 text-right">
                                                <div className="text-[9px] uppercase text-muted-foreground font-black tracking-widest opacity-40">Author</div>
                                                <div className="text-[11px] text-foreground font-black uppercase tracking-tight">{a.author.rpName}</div>
                                                <div className="text-[9px] text-primary/60 font-black uppercase tracking-widest leading-none">{a.author.rank.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/5 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></div>
                                </div>
                            )
                        })
                    ) : (
                        <div className="p-24 text-center border border-dashed border-border rounded-lg bg-card/20 flex flex-col items-center gap-4 opacity-40">
                            <Bell size={48} className="text-muted-foreground" />
                            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.4em] italic">{dict.announcements.no_announcements}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* View Modal */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAnnouncement(null)} />
                    <div className="relative w-full max-w-2xl bg-[#0D0F0F] border border-border/50 rounded-lg shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-border/20 flex items-center justify-between bg-card/30">
                            <div className="flex items-center gap-3">
                                <Shield className="text-primary size-5" />
                                <h2 className="text-[12px] font-black uppercase tracking-[.3em] text-foreground">Operational Bulletin</h2>
                            </div>
                            <button onClick={() => setSelectedAnnouncement(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 flex-wrap">
                                    {selectedAnnouncement.isPinned && (
                                        <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-full">
                                            PINNED
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 border text-[9px] font-black uppercase tracking-widest rounded-full ${getPriorityStyles(selectedAnnouncement.priority).bg} ${getPriorityStyles(selectedAnnouncement.priority).border} ${getPriorityStyles(selectedAnnouncement.priority).text}`}>
                                        {dict.announcements.priority?.[selectedAnnouncement.priority as keyof typeof dict.announcements.priority]?.toUpperCase() || selectedAnnouncement.priority.toUpperCase()}
                                    </span>
                                </div>
                                <h1 className="text-4xl font-black uppercase italic tracking-tighter text-foreground leading-none">{selectedAnnouncement.title}</h1>
                                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 border-y border-border/10 py-4 mt-8">
                                    <span className="flex items-center gap-2"><User size={14} className="text-primary/60" /> {selectedAnnouncement.author.rpName}</span>
                                    <span className="flex items-center gap-2"><Clock size={14} className="text-primary/60" /> {new Date(selectedAnnouncement.createdAt).toLocaleString()}</span>
                                    <span
                                        className="flex items-center gap-2 cursor-help relative group/readers"
                                        onMouseEnter={() => handleFetchReaders(selectedAnnouncement.id)}
                                    >
                                        <Eye size={14} className="text-primary/60" />
                                        {selectedAnnouncement._count.readBy} {dict.announcements?.read_tracking?.title?.split(" ")[0] || "READS"}

                                        {/* Readers Tooltip */}
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#0D0F0F] border border-border/50 rounded-md shadow-xl opacity-0 group-hover/readers:opacity-100 transition-opacity pointer-events-none z-50 p-3">
                                            <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2 border-b border-border/20 pb-1">
                                                {dict.announcements?.read_tracking?.read_by || "Read By"}
                                            </div>
                                            {loadingReaders ? (
                                                <div className="text-[10px] text-muted-foreground animate-pulse">{dict.announcements?.read_tracking?.loading || "Loading..."}</div>
                                            ) : readers.length > 0 ? (
                                                <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1">
                                                    {readers.map((r: any) => (
                                                        <div key={r.userId} className="flex justify-between items-center text-[10px]">
                                                            <span className="text-foreground font-bold">{r.user.rpName}</span>
                                                            <span className="text-muted-foreground text-[9px]">{new Date(r.readAt).toLocaleDateString()}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-[10px] text-muted-foreground italic">{dict.announcements?.read_tracking?.no_reads || "No reads"}</div>
                                            )}
                                        </div>
                                    </span>
                                </div>
                            </div>

                            <div className="text-[15px] text-foreground/90 leading-relaxed font-medium whitespace-pre-wrap selection:bg-primary selection:text-white">
                                {selectedAnnouncement.body}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-6 bg-card/50 border-t border-border/20 flex items-center justify-between">
                            <div className="flex -space-x-2 overflow-hidden">
                                {/* Future: Show avatars of people who read it */}
                                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest bg-muted/30 px-3 py-1.5 rounded border border-border/30">
                                    Data Source: CENTRAL_ND_SERVER
                                </div>
                            </div>

                            {!selectedAnnouncement.isRead ? (
                                <button
                                    onClick={() => handleMarkAsRead(selectedAnnouncement.id)}
                                    className="flex items-center gap-3 px-8 py-3 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 text-[11px] font-black uppercase tracking-[0.2em] rounded transition-all active:scale-95 shadow-lg shadow-primary/5"
                                >
                                    <Check size={16} />
                                    {dict.common.confirm}
                                </button>
                            ) : (
                                <div className="flex items-center gap-2 text-green-500 text-[11px] font-black uppercase tracking-widest bg-green-500/5 px-6 py-3 rounded border border-green-500/20">
                                    <CheckCircle2 size={16} />
                                    {dict.announcements.status.read}
                                </div>
                            )}
                        </div>

                        {/* Admin Actions */}
                        {isAdmin && (
                            <div className="px-8 py-4 bg-red-500/5 border-t border-red-500/10 flex justify-end">
                                <button
                                    onClick={() => handleDelete(selectedAnnouncement.id)}
                                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-500/10 rounded text-[10px] font-black uppercase tracking-widest transition-colors"
                                >
                                    <Trash2 size={14} />
                                    {dict.announcements?.delete || "Delete"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Create Modal (Admin) */}
            {isCreateModalOpen && isAdmin && (
                <CreateAnnouncementModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false)
                        fetchAnnouncements()
                    }}
                    dict={dict}
                    session={session}
                />
            )}
        </>
    )
}

function CreateAnnouncementModal({ onClose, onSuccess, dict, session }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        body: "",
        priority: "normal",
        isPinned: false
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await createAnnouncement({
            ...formData
        })
        if (res.success) {
            onSuccess()
        } else {
            alert(res.error)
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <form onSubmit={handleSubmit} className="relative w-full max-w-2xl bg-[#0D0F0F] border border-primary/30 rounded-lg shadow-2xl flex flex-col overflow-hidden">
                <div className="px-8 py-6 border-b border-border/20 flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3 text-primary">
                        <Plus className="size-5" />
                        <h2 className="text-[12px] font-black uppercase tracking-[.3em]">Publish Operational Intel</h2>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-10 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">{dict.announcements.form.title}</label>
                        <input
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-white/[0.03] border border-border/50 rounded px-6 py-4 text-lg font-black uppercase tracking-tight italic placeholder:opacity-20 focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="OPERATION_CODENAME / INTEL_TITLE"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">{dict.announcements.form.priority}</label>
                            <select
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full bg-[#0D0F0F] border border-border/50 rounded px-4 py-3 text-[11px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all cursor-pointer"
                            >
                                <option value="normal">Normal</option>
                                <option value="high">High Priority</option>
                                <option value="critical">Critical / Urgent</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Interaction</label>
                            <label className="flex items-center gap-3 w-full bg-[#0D0F0F] border border-border/50 rounded px-4 py-3 cursor-pointer hover:bg-white/5 transition-all">
                                <input
                                    type="checkbox"
                                    checked={formData.isPinned}
                                    onChange={e => setFormData({ ...formData, isPinned: e.target.checked })}
                                    className="size-4 accent-primary"
                                />
                                <span className="text-[11px] font-black uppercase tracking-widest text-foreground">{dict.announcements.form.pinned}</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">{dict.announcements.form.body}</label>
                        <textarea
                            required
                            rows={8}
                            value={formData.body}
                            onChange={e => setFormData({ ...formData, body: e.target.value })}
                            className="w-full bg-white/[0.03] border border-border/50 rounded px-6 py-4 text-[13px] font-medium leading-relaxed selection:bg-primary selection:text-white focus:outline-none focus:border-primary/50 transition-all resize-none italic"
                            placeholder="Type operational intel content here..."
                        />
                    </div>
                </div>

                <div className="px-8 py-6 bg-muted/10 border-t border-border/20 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-muted/20 text-muted-foreground border border-border/50 text-[11px] font-black uppercase tracking-widest rounded hover:bg-muted/30 transition-all"
                    >
                        {dict.common.cancel}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded border border-primary/50 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? 'TRANSMITTING...' : (
                            <>
                                <Send size={16} />
                                {dict.announcements.form.publish}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
