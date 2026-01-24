"use client"

import { useState, useEffect } from "react"
import { useTranslation } from "@/lib/i18n"
import { getRanks, updateOfficerProfile } from "@/app/actions/user"
import { Save, X, Loader2, Upload, User2, BadgeCheck, Shield, Phone, Mail, Activity } from "lucide-react"

interface ProfileEditProps {
    profile: any
    isSelf: boolean
    isAdmin: boolean
    onCancel: () => void
    onSave: () => void
}

export default function ProfileEdit({ profile, isSelf, isAdmin, onCancel, onSave }: ProfileEditProps) {
    const { dict } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [ranks, setRanks] = useState<any[]>([])
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [newAvatarUrl, setNewAvatarUrl] = useState(profile.avatarUrl || "")

    // Split rpName into first/last if empty
    const initialFirst = profile.firstName || profile.rpName.split(' ')[0] || ""
    const initialLast = profile.lastName || profile.rpName.split(' ').slice(1).join(' ') || ""

    const [formData, setFormData] = useState({
        firstName: initialFirst,
        lastName: initialLast,
        badgeNumber: profile.badgeNumber,
        rankId: profile.rankId,
        phoneNumber: profile.phoneNumber || "",
        email: profile.email || "",
        status: profile.status,
        unitAssignment: profile.unitAssignment || "",
        notes: profile.notes || "",
        avatarUrl: profile.avatarUrl || null
    })

    useEffect(() => {
        getRanks().then(setRanks)
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await updateOfficerProfile(profile.id, {
                ...formData,
                avatarUrl: newAvatarUrl
            })
            if (res.success) {
                onSave()
            } else {
                alert(res.error)
            }
        } catch (error) {
            console.error("Save failed:", error)
        } finally {
            setLoading(false)
        }
    }

    const canEditProtected = isAdmin
    const canEditBasic = isSelf || isAdmin

    const InputLabel = ({ children }: { children: React.ReactNode }) => (
        <label className="text-[9px] font-black uppercase tracking-[.2em] text-primary/60 mb-1.5 flex items-center gap-2">
            {children}
        </label>
    )

    return (
        <form onSubmit={handleSave} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
                <div
                    onClick={() => canEditBasic && setShowUploadModal(true)}
                    className="relative w-32 h-32 bg-muted border-2 border-primary/20 rounded-lg overflow-hidden group cursor-pointer hover:border-primary/40 transition-all"
                >
                    {newAvatarUrl ? (
                        <img src={newAvatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/5">
                            <User2 size={48} className="text-primary/20" />
                        </div>
                    )}
                    {canEditBasic && (
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload size={24} className="text-white mb-2" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white">Zmień awatar</span>
                        </div>
                    )}
                </div>
                <div className="text-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Awatar Funkcjonariusza</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-wider mt-1">Kwadrat 1:1, min. 512x512px</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                {/* Tactical Identity (Protected) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[.3em] text-primary/40 whitespace-nowrap text-left">Dane Służbowe</h4>
                        <div className="h-px w-full bg-gradient-to-r from-primary/10 to-transparent" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel>Imię</InputLabel>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                disabled={!canEditProtected}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-3 py-2 text-xs font-bold uppercase tracking-tight text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
                            />
                        </div>
                        <div>
                            <InputLabel>Nazwisko</InputLabel>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                disabled={!canEditProtected}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-3 py-2 text-xs font-bold uppercase tracking-tight text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <InputLabel><BadgeCheck size={10} /> Numer Odznaki</InputLabel>
                            <input
                                type="text"
                                value={formData.badgeNumber}
                                onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                                disabled={!canEditProtected}
                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-3 py-2 text-xs font-bold uppercase tracking-tight text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
                            />
                        </div>
                        <div>
                            <InputLabel><Shield size={10} /> Stopień</InputLabel>
                            <div className="w-full bg-[#0D0F0F] border border-white/[0.08] rounded px-3 py-2 text-xs font-bold uppercase tracking-tight text-foreground/50 cursor-not-allowed">
                                {ranks.find(r => r.id === formData.rankId)?.name || "Nieznany"}
                            </div>
                        </div>
                    </div>

                    <div>
                        <InputLabel><Activity size={10} /> Status Służbowy</InputLabel>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            disabled={!canEditBasic}
                            className="w-full bg-[#0D0F0F] border border-white/[0.08] rounded px-3 py-2 text-xs font-bold uppercase tracking-tight text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
                        >
                            <option value="Active">Aktywny</option>
                            <option value="Leave">Na Urlopie</option>
                            <option value="Rest">Odpoczynek</option>
                            <option value="Suspended" disabled={!isAdmin}>Zawieszony</option>
                        </select>
                    </div>
                </div>

                {/* Contact & Operations */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[.3em] text-primary/40 whitespace-nowrap text-left">Dane Kontaktowe</h4>
                        <div className="h-px w-full bg-gradient-to-r from-primary/10 to-transparent" />
                    </div>

                    <div>
                        <InputLabel><Phone size={10} /> Telefon</InputLabel>
                        <input
                            type="text"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            disabled={!canEditBasic}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-3 py-2 text-xs font-bold uppercase tracking-tight text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
                            placeholder="Wprowadź numeru telefonu..."
                        />
                    </div>

                    <div>
                        <InputLabel><Mail size={10} /> Email Kontaktowy</InputLabel>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={!canEditBasic}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-3 py-2 text-xs font-bold uppercase tracking-tight text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
                            placeholder="Wprowadź email..."
                        />
                    </div>

                    <div>
                        <InputLabel>Przydział Jednostki</InputLabel>
                        <input
                            type="text"
                            value={formData.unitAssignment}
                            onChange={(e) => setFormData({ ...formData, unitAssignment: e.target.value })}
                            disabled={!canEditProtected}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-3 py-2 text-xs font-bold uppercase tracking-tight text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors"
                            placeholder="np. Narcotics / Gang Task Force"
                        />
                    </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                    <InputLabel>Notatki Funkcjonariusza</InputLabel>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        disabled={!canEditBasic}
                        rows={3}
                        className="w-full bg-white/[0.03] border border-white/[0.08] rounded px-4 py-3 text-xs font-medium leading-relaxed text-foreground focus:outline-none focus:border-primary/50 disabled:opacity-50 transition-colors resize-none italic"
                        placeholder="Wprowadź dodatkowe notatki o funkcjonariuszu..."
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 border-t border-white/[0.05] pt-8">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex-1 py-3 bg-white/[0.03] border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.08] rounded-md transition-all text-xs font-black uppercase tracking-[.2em] flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                    <X size={14} />
                    Anuluj
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 rounded-md transition-all text-xs font-black uppercase tracking-[.2em] flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
                >
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Zapisz Zmiany
                </button>
            </div>

            {/* Avatar Upload Mini-Dialog */}
            {showUploadModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowUploadModal(false)} />
                    <div className="relative w-full max-w-md bg-[#161818] border border-border shadow-2xl rounded-lg p-6 animate-in zoom-in-95 duration-200">
                        <h3 className="text-sm font-black uppercase tracking-widest mb-6">Aktualizacja Awatara</h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Adres URL Obrazu</label>
                                <input
                                    type="text"
                                    value={newAvatarUrl}
                                    onChange={(e) => setNewAvatarUrl(e.target.value)}
                                    placeholder="Wklej URL zdjęcia..."
                                    className="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-foreground focus:border-primary/50 outline-none"
                                />
                            </div>

                            <p className="text-[9px] text-muted-foreground uppercase leading-relaxed">
                                Wprowadź bezpośredni link do pliku obrazu (JPG, PNG). Zostanie on wykadrowany do proporcji 1:1.
                            </p>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button
                                type="button"
                                onClick={() => {
                                    setNewAvatarUrl(profile.avatarUrl || "")
                                    setShowUploadModal(false)
                                }}
                                className="flex-1 py-2 bg-muted/50 text-[10px] font-black uppercase tracking-widest rounded hover:bg-muted transition-colors"
                            >
                                Anuluj
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowUploadModal(false)}
                                className="flex-1 py-2 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded hover:bg-primary/90 transition-all active:scale-95"
                            >
                                Zastosuj
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}
