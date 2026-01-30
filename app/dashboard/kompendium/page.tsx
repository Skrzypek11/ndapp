"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useTranslation } from "@/lib/i18n"
import { getCompendiumDocs, createCompendiumDoc, getCategories, deleteCompendiumDoc } from "@/app/actions/kompendium"
import {
    BookOpen, Search, Folder, FileText,
    Plus, ChevronRight, Hash, Clock,
    User, X, Save, Layers, Archive,
    Sidebar as SidebarIcon
} from "lucide-react"

import RichTextEditor from "@/components/shared/RichTextEditor"

export default function KompendiumPage() {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const [docs, setDocs] = useState<any[]>([])
    const [categories, setCategories] = useState<string[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedDoc, setSelectedDoc] = useState<any>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const [docsData, catsData] = await Promise.all([
            getCompendiumDocs(selectedCategory || undefined),
            getCategories()
        ])
        setDocs(docsData)
        setCategories(catsData)
        setLoading(false)
    }, [selectedCategory])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const filteredDocs = docs.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.body.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const isAdmin = session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in">
            {/* Categories Sidebar */}
            <aside className={`${isSidebarOpen ? 'w-80' : 'w-0 overflow-hidden'} transition-all duration-300 flex flex-col gap-4`}>
                <div className="card-container flex flex-col h-full overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Layers size={18} className="text-primary" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground italic">{dict.kompendium.library_index}</h3>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded text-[11px] font-black uppercase tracking-widest transition-all border ${selectedCategory === null
                                ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                                : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`}
                        >
                            <Archive size={14} />
                            {dict.kompendium.all_records}
                        </button>

                        <div className="h-px bg-border/20 mx-2 my-4" />

                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-[11px] font-black uppercase tracking-widest transition-all border ${selectedCategory === cat
                                    ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                                    : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                    }`}
                            >
                                <Folder size={14} className={selectedCategory === cat ? 'text-primary' : 'text-primary/40'} />
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col gap-6 min-w-0">
                {/* Search & Breadcrumb */}
                <div className="card-container p-6 flex flex-col md:flex-row items-center gap-6">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="btn-icon"
                    >
                        <SidebarIcon size={18} />
                    </button>

                    <div className="relative flex-1 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-focus-within:text-primary transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder={dict.kompendium.search}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-muted/20 border border-border rounded-md pl-12 pr-6 py-3 text-sm font-medium focus:outline-none focus:border-primary/40 focus:bg-muted/40 transition-all placeholder:text-muted-foreground/30 italic"
                        />
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="btn-primary whitespace-nowrap"
                        >
                            <Plus size={16} />
                            {dict.kompendium.create}
                        </button>
                    )}
                </div>

                <div className="flex-1 flex gap-6 overflow-hidden">
                    {/* Document List or Content View */}
                    <div className={`${selectedDoc ? 'flex-1' : 'w-full'} card-container flex flex-col overflow-hidden transition-all duration-300`}>
                        {!selectedDoc ? (
                            <>
                                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <BookOpen size={18} className="text-primary" />
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground italic">{dict.kompendium.available_intel}</h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{filteredDocs.length} {dict.kompendium.entries_found}</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="h-20 bg-muted/20 border border-border/40 rounded mb-4 animate-pulse" />
                                        ))
                                    ) : filteredDocs.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {filteredDocs.map(doc => (
                                                <button
                                                    key={doc.id}
                                                    onClick={() => setSelectedDoc(doc)}
                                                    className="p-6 bg-muted/10 border border-border/50 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-all text-left flex flex-col group relative overflow-hidden"
                                                >
                                                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-primary/60 mb-3">
                                                        <Folder size={10} /> {doc.category}
                                                    </div>
                                                    <h4 className="text-sm font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors leading-tight italic mb-3">{doc.title}</h4>
                                                    <div className="mt-auto pt-4 border-t border-border/10 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground/40">
                                                        <span className="flex items-center gap-1"><User size={10} /> {doc.author.lastName}</span>
                                                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(doc.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-10 transition-opacity">
                                                        <FileText size={40} />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40 grayscale py-32">
                                            <Archive size={48} className="text-muted-foreground" />
                                            <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.4em] italic">{dict.kompendium.no_docs}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col h-full overflow-hidden">
                                <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between shadow-sm relative z-10">
                                    <button
                                        onClick={() => setSelectedDoc(null)}
                                        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all"
                                    >
                                        <ChevronRight size={14} className="rotate-180" /> {dict.kompendium.back_to_library}
                                    </button>
                                    <div className="flex items-center gap-6">
                                        {isAdmin && (
                                            <button
                                                onClick={async () => {
                                                    if (confirm(dict.kompendium.delete_confirm)) {
                                                        const res = await deleteCompendiumDoc(selectedDoc.id)
                                                        if (res.success) {
                                                            setSelectedDoc(null)
                                                            fetchData()
                                                        } else {
                                                            alert(res.error)
                                                        }
                                                    }
                                                }}
                                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-destructive hover:text-destructive/80 transition-all border border-destructive/20 hover:bg-destructive/10 px-3 py-1.5 rounded"
                                            >
                                                <X size={12} /> {dict.kompendium.delete}
                                            </button>
                                        )}
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/60">
                                            <Folder size={12} /> {selectedDoc.category.replace(/\//g, ' > ')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar selection:bg-primary selection:text-white">
                                    <div className="max-w-4xl mx-auto space-y-12">
                                        <div className="space-y-6">
                                            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none text-foreground drop-shadow-sm">{selectedDoc.title}</h1>
                                            <div className="flex items-center gap-8 py-6 border-y border-border/10 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[8px] text-primary/40 leading-none">{dict.kompendium.author}</span>
                                                    <span className="flex items-center gap-2"><User size={14} className="text-primary/60" /> {selectedDoc.author.rpName}</span>
                                                </div>
                                                <div className="h-8 w-px bg-border/20" />
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[8px] text-primary/40 leading-none">{dict.kompendium.date}</span>
                                                    <span className="flex items-center gap-2"><Clock size={14} className="text-primary/60" /> {new Date(selectedDoc.createdAt).toLocaleString()}</span>
                                                </div>
                                                {selectedDoc.tags && (
                                                    <>
                                                        <div className="h-8 w-px bg-border/20" />
                                                        <div className="flex flex-col gap-1.5">
                                                            <span className="text-[8px] text-primary/40 leading-none">{dict.kompendium.tags}</span>
                                                            <span className="flex items-center gap-2">
                                                                <Hash size={14} className="text-primary/60" />
                                                                <div className="flex gap-2">
                                                                    {selectedDoc.tags.split(',').map((t: string) => (
                                                                        <span key={t} className="px-1.5 py-0.5 bg-primary/10 rounded-sm text-primary">{t.trim()}</span>
                                                                    ))}
                                                                </div>
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="prose prose-invert prose-p:text-foreground/80 prose-p:leading-relaxed prose-headings:uppercase prose-headings:italic prose-headings:font-black prose-headings:tracking-tight max-w-none whitespace-pre-wrap">
                                            {selectedDoc.body}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Create Doc Modal (Admin) */}
            {isCreateModalOpen && isAdmin && (
                <CreateDocModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={() => {
                        setIsCreateModalOpen(false)
                        fetchData()
                    }}
                    dict={dict}
                    session={session}
                />
            )}
        </div>
    )
}

function CreateDocModal({ onClose, onSuccess, dict, session }: any) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        category: "",
        body: "",
        tags: ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const res = await createCompendiumDoc({
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
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose} />
            <form onSubmit={handleSubmit} className="relative w-full max-w-4xl bg-[#0D0F0F] border border-primary/20 rounded-lg shadow-2xl flex flex-col overflow-hidden max-h-[95vh]">
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                    <div className="flex items-center gap-3 text-primary">
                        <Plus size={20} />
                        <h2 className="text-[12px] font-black uppercase tracking-[.3em]">Operational Intel Registration</h2>
                    </div>
                    <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10">
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Documentation Title</label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter Title..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded px-6 py-4 text-lg font-black uppercase tracking-tight italic focus:outline-none focus:border-primary/40 transition-colors"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Registry category</label>
                            <input
                                required
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g. Law Enforcement / Protocols"
                                className="w-full bg-white/[0.03] border border-white/10 rounded px-6 py-4 text-lg font-black uppercase tracking-tight italic focus:outline-none focus:border-primary/40 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Intelligence Dossier Content</label>
                        <div className="border border-white/10 rounded overflow-hidden bg-black/20">
                            <RichTextEditor
                                content={formData.body}
                                onChange={html => setFormData({ ...formData, body: html })}
                                placeholder="Type documentation content here..."
                                minHeight="400px"
                                templateCategory="KOMPENDIUM"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">Security Tags (Comma separated)</label>
                        <input
                            value={formData.tags}
                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                            placeholder="e.g. RESTRICTED, CODED, LEVEL_3"
                            className="w-full bg-white/[0.03] border border-white/10 rounded px-6 py-4 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-primary/40 transition-colors"
                        />
                    </div>
                </div>

                <div className="px-8 py-6 bg-muted/10 border-t border-white/5 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-muted/20 text-muted-foreground border border-white/5 text-[11px] font-black uppercase tracking-widest rounded hover:bg-muted/30 transition-all font-black"
                    >
                        Abort Registration
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-4 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest rounded border border-primary/50 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? 'PROCESSING...' : (
                            <>
                                <Save size={18} />
                                Seal & Register Protocol
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
