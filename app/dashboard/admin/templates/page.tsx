"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Plus, Trash, Edit, FileText, ChevronRight, Save, X } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { createPortal } from "react-dom"
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "@/app/actions/templates"
import { Modal } from "@/components/ui/Modal"
import RichTextEditor from "@/components/shared/RichTextEditor"

export default function TemplatesPage() {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const router = useRouter()

    const [templates, setTemplates] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState<any>(null)

    const fetchTemplates = async () => {
        setLoading(true)
        const data = await getTemplates()
        setTemplates(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchTemplates()
    }, [])

    const handleCreate = () => {
        setEditingTemplate({
            name: "",
            description: "",
            content: "<p>New template content...</p>",
            type: "REPORT"
        })
        setIsEditModalOpen(true)
    }

    const handleEdit = (t: any) => {
        setEditingTemplate({ ...t })
        setIsEditModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm(dict.admin.templates.delete_confirm)) {
            await deleteTemplate(id)
            fetchTemplates()
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingTemplate) return

        if (editingTemplate.id) {
            await updateTemplate(editingTemplate.id, editingTemplate)
        } else {
            await createTemplate(editingTemplate)
        }
        setIsEditModalOpen(false)
        fetchTemplates()
    }

    const groups = {
        REPORT: templates.filter(t => t.type === 'REPORT'),
        CASE: templates.filter(t => t.type === 'CASE'),
        KOMPENDIUM: templates.filter(t => t.type === 'KOMPENDIUM'),
    }

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            <header className="flex items-center justify-between bg-card border border-border p-6 rounded-md shadow-xl backdrop-blur-md bg-opacity-95">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-primary/20 rounded flex items-center justify-center text-primary border border-primary/30 shadow-inner">
                        <FileText size={28} />
                    </div>
                    <div>
                        <h1 className="text-h1 text-foreground leading-none mb-1 uppercase font-black italic">{dict.admin.templates.title}</h1>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono leading-none">
                            {dict.admin.templates.subtitle}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md text-small font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
                >
                    <Plus size={16} />
                    {dict.admin.templates.create}
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(Object.entries(groups) as [string, any[]][]).map(([type, list]) => (
                    <div key={type} className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                            <span className="text-small font-black uppercase tracking-[0.2em] text-primary">{type} Templates</span>
                            <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-bold">{list.length}</span>
                        </div>
                        <div className="space-y-3">
                            {list.map(t => (
                                <div key={t.id} className="bg-card border border-border rounded-md p-4 group hover:border-primary/50 transition-all shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-small font-bold text-foreground uppercase tracking-tight">{t.name}</h3>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(t)} className="p-1.5 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded">
                                                <Edit size={14} />
                                            </button>
                                            <button onClick={() => handleDelete(t.id)} className="p-1.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded">
                                                <Trash size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mb-3 font-medium leading-relaxed line-clamp-2">{t.description || "No description provided."}</p>
                                    <div className="text-[9px] font-mono text-primary/50 uppercase tracking-widest">
                                        {dict.admin.templates.last_updated}: {new Date(t.updatedAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                            {list.length === 0 && (
                                <div className="p-8 text-center border border-dashed border-border rounded-md">
                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic opacity-50">{dict.admin.templates.no_templates}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)} />
                    <form onSubmit={handleSave} className="relative w-full max-w-5xl bg-[#0D0F0F] border border-primary/20 rounded-lg shadow-2xl flex flex-col overflow-hidden h-[90vh]">
                        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                            <div className="flex items-center gap-3 text-primary">
                                <Edit size={20} />
                                <h2 className="text-[12px] font-black uppercase tracking-[.3em]">{editingTemplate.id ? dict.admin.templates.edit : dict.admin.templates.create}</h2>
                            </div>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                            <div className="grid grid-cols-3 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">{dict.admin.templates.name}</label>
                                    <input
                                        required
                                        value={editingTemplate.name}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary/40 transition-colors"
                                        placeholder={dict.admin.templates.name_placeholder}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">{dict.admin.templates.context}</label>
                                    <select
                                        value={editingTemplate.type}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, type: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary/40 transition-colors text-foreground [&>option]:bg-black"
                                    >
                                        <option value="REPORT">Report</option>
                                        <option value="CASE">Case</option>
                                        <option value="KOMPENDIUM">Kompendium</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">{dict.admin.templates.description}</label>
                                    <input
                                        value={editingTemplate.description}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary/40 transition-colors"
                                        placeholder={dict.admin.templates.desc_placeholder}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 flex-1 flex flex-col min-h-[500px]">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60">{dict.admin.templates.content}</label>
                                <div className="flex-1 border border-white/10 rounded overflow-hidden bg-black/20">
                                    <RichTextEditor
                                        content={editingTemplate.content}
                                        onChange={html => setEditingTemplate({ ...editingTemplate, content: html })}
                                        minHeight="500px"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 bg-muted/10 border-t border-white/5 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-8 py-3 bg-muted/20 text-muted-foreground border border-white/5 text-[10px] font-black uppercase tracking-widest rounded hover:bg-muted/30 transition-all"
                            >
                                {dict.admin.templates.cancel}
                            </button>
                            <button
                                type="submit"
                                className="px-8 py-3 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded border border-primary/50 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={14} />
                                {dict.admin.templates.save}
                            </button>
                        </div>
                    </form>
                </div>,
                document.body
            )}
        </div>
    )
}
