"use client"

import { useState, useEffect } from "react"
import { Search, Plus, X, Package, Check } from "lucide-react"
import { getUnlinkedConfiscations } from "@/app/actions/confiscations"
import { useTranslation } from "@/lib/i18n"

interface ConfiscationLinkerProps {
    linkedConfiscations: any[]
    onLink: (confiscations: any[]) => void
    onUnlink: (id: string) => void
    readOnly?: boolean
}

export default function ConfiscationLinker({ linkedConfiscations, onLink, onUnlink, readOnly = false }: ConfiscationLinkerProps) {
    const { dict } = useTranslation()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [searching, setSearching] = useState(false)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (search.length >= 2) {
                setSearching(true)
                const data = await getUnlinkedConfiscations(search)
                setResults(data)
                setSearching(false)
            } else {
                setResults([])
            }
        }, 300)
        return () => clearTimeout(timeout)
    }, [search])

    const handleConfirm = () => {
        const selected = results.filter(r => selectedIds.has(r.id))
        onLink(selected)
        setIsModalOpen(false)
        setSearch("")
        setSelectedIds(new Set())
    }

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedIds(next)
    }

    return (
        <div className="space-y-4">
            {/* Linked List */}
            <div className="space-y-2">
                {linkedConfiscations.map(c => (
                    <div key={c.id} className="bg-background border border-border p-3 rounded flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                <Package size={16} />
                            </div>
                            <div>
                                <div className="text-[11px] font-black uppercase tracking-wide text-foreground">
                                    {c.drugType} - {c.quantity}g
                                </div>
                                <div className="text-[10px] text-muted-foreground">
                                    {dict.confiscations.list.citizen}: <span className="text-foreground">{c.citizenName || dict.confiscations.linker.unknown_citizen}</span> • {dict.confiscations.list.officer}: {c.officer?.rpName}
                                </div>
                            </div>
                        </div>
                        {!readOnly && (
                            <button
                                onClick={() => onUnlink(c.id)}
                                className="p-1 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded transition-all"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                ))}

                {linkedConfiscations.length === 0 && (
                    <div className="text-[11px] text-muted-foreground italic p-4 text-center border border-dashed border-border rounded">
                        {dict.confiscations.linker.no_linked}
                    </div>
                )}
            </div>

            {/* Add Button */}
            {!readOnly && (
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-2 border border-dashed border-primary/30 text-primary/70 hover:bg-primary/5 hover:text-primary hover:border-primary/50 rounded flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <Plus size={14} />
                    {dict.confiscations.linker.button}
                </button>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-card border border-border rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                            <h3 className="text-small font-black uppercase tracking-widest">{dict.confiscations.linker.modal_title}</h3>
                            <button onClick={() => setIsModalOpen(false)}>
                                <X size={18} className="text-muted-foreground hover:text-foreground" />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            <div className="relative">
                                <input
                                    autoFocus
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={dict.confiscations.linker.search_placeholder}
                                    className="w-full bg-background border border-border rounded p-3 pl-9 text-small focus:outline-none focus:border-primary/50"
                                />
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            </div>

                            <div className="max-h-[300px] overflow-y-auto space-y-1 custom-scrollbar min-h-[100px]">
                                {searching ? (
                                    <div className="text-center py-8 text-[10px] text-muted-foreground uppercase tracking-widest animate-pulse">{dict.confiscations.linker.searching}</div>
                                ) : results.length > 0 ? (
                                    results.map(r => (
                                        <button
                                            key={r.id}
                                            onClick={() => toggleSelect(r.id)}
                                            className={`w-full text-left p-3 rounded border transition-all flex items-center justify-between ${selectedIds.has(r.id)
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-background border-border hover:bg-muted"
                                                }`}
                                        >
                                            <div>
                                                <div className="text-[11px] font-bold uppercase">{r.citizenName || dict.confiscations.linker.unknown_citizen}</div>
                                                <div className="text-[10px] opacity-70">{r.drugType} • {r.quantity}g</div>
                                            </div>
                                            {selectedIds.has(r.id) && <Check size={16} />}
                                        </button>
                                    ))
                                ) : search.length >= 2 ? (
                                    <div className="text-center py-8 text-[10px] text-muted-foreground">{dict.confiscations.linker.no_results}</div>
                                ) : (
                                    <div className="text-center py-8 text-[10px] text-muted-foreground">{dict.confiscations.linker.type_to_search}</div>
                                )}
                            </div>

                            <button
                                onClick={handleConfirm}
                                disabled={selectedIds.size === 0}
                                className="w-full bg-primary text-primary-foreground py-3 rounded text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-all"
                            >
                                {dict.confiscations.linker.link_selected} ({selectedIds.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
