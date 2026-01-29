"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { getDrugTypes, createDrugType, deleteDrugType } from "@/app/actions/registries"
import { ChevronLeft, Scale, Plus, Trash2, Atom } from "lucide-react"

export default function DrugsRegistryPage() {
    const { dict } = useTranslation()
    const router = useRouter()
    const [drugs, setDrugs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const loadData = async () => {
        const data = await getDrugTypes()
        setDrugs(data)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        setSubmitting(true)
        const res = await createDrugType(newName)
        if (res.success) {
            setNewName("")
            loadData()
        } else {
            alert(res.error)
        }
        setSubmitting(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm(dict.admin_panel.drugs.delete_confirm)) return

        const res = await deleteDrugType(id)
        if (res.success) {
            loadData()
        } else {
            alert(res.error)
        }
    }

    return (
        <div className="animate-fade-in space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 bg-card border border-border p-6 rounded-md shadow-sm">
                <button
                    onClick={() => router.push('/dashboard/admin/panel')}
                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
                        <Scale className="text-emerald-500" size={28} />
                        {dict.admin_panel.drugs.title}
                    </h1>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        {dict.admin_panel.subtitle}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* List Column */}
                <div className="md:col-span-2 bg-card border border-border rounded-md shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Active Substances
                        </span>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground animate-pulse text-[10px] uppercase font-bold tracking-widest">
                            Loading Registry...
                        </div>
                    ) : drugs.length === 0 ? (
                        <div className="p-12 text-center text-muted-foreground italic text-[11px]">
                            No substances defined. Add one to get started.
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {drugs.map(drug => (
                                <div key={drug.id} className="p-4 flex items-center justify-between group hover:bg-muted/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Atom size={16} />
                                        </div>
                                        <span className="font-bold text-small text-foreground uppercase tracking-wide">
                                            {drug.name}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(drug.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Column */}
                <div className="bg-card border border-border rounded-md shadow-sm h-fit">
                    <div className="p-4 border-b border-border bg-muted/10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {dict.admin_panel.drugs.create}
                        </span>
                    </div>
                    <form onSubmit={handleAdd} className="p-4 space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">
                                {dict.admin_panel.drugs.name}
                            </label>
                            <input
                                type="text"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder={dict.admin_panel.drugs.placeholder}
                                className="w-full bg-background border border-border rounded p-3 text-small focus:outline-none focus:border-emerald-500/50 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || !newName.trim()}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Plus size={16} />
                            )}
                            Add To Registry
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
