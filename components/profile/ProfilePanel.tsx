"use client"

import { useEffect, useState, useCallback } from "react"
import { X, Edit2, Shield, Loader2 } from "lucide-react"
import { useProfileStore } from "@/lib/store/profile"
import { useTranslation } from "@/lib/i18n"
import { getOfficerProfile } from "@/app/actions/user"
import ProfileView from "./ProfileView"
import ProfileEdit from "./ProfileEdit"
import { useSession } from "next-auth/react"

export default function ProfilePanel() {
    const { isOpen, userId, mode, closeProfile, setMode } = useProfileStore()
    const { dict } = useTranslation()
    const { data: session } = useSession()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const fetchProfile = useCallback(async () => {
        if (!userId) return
        setLoading(true)
        try {
            const data = await getOfficerProfile(userId)
            setProfile(data)
        } catch (error) {
            console.error("Failed to fetch profile:", error)
        } finally {
            setLoading(false)
        }
    }, [userId])

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile()
        } else {
            setProfile(null)
        }
    }, [isOpen, userId, fetchProfile])

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeProfile()
        }
        window.addEventListener("keydown", handleEsc)
        return () => window.removeEventListener("keydown", handleEsc)
    }, [closeProfile])

    if (!isOpen) return null

    const isAdmin = session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"
    const isSelf = session?.user?.id === userId
    const canEdit = isSelf || isAdmin

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/65 backdrop-blur-[3px] animate-fade-in"
                onClick={closeProfile}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-[900px] max-h-[90vh] bg-[#0D0F0F] border border-border/40 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col animate-in fade-in zoom-in duration-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border/20 flex items-center justify-between shrink-0 bg-[#0D0F0F]">
                    <div className="flex items-center gap-3">
                        <Shield className="text-primary size-5" />
                        <h2 className="text-sm font-black uppercase tracking-[.2em] text-foreground">
                            {dict.profile.title}
                        </h2>
                        {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                    </div>

                    <div className="flex items-center gap-2">
                        {profile && canEdit && mode === 'view' && (
                            <button
                                onClick={() => setMode('edit')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                                <Edit2 size={12} />
                                {dict.profile.edit}
                            </button>
                        )}
                        <button
                            onClick={closeProfile}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading && !profile ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="size-10 animate-spin text-primary/40" />
                            <span className="text-[10px] font-black uppercase tracking-[.3em] text-muted-foreground">Synchronizing Data...</span>
                        </div>
                    ) : profile && (
                        <div className="p-8">
                            {mode === 'view' ? (
                                <ProfileView profile={profile} isSelf={isSelf} isAdmin={isAdmin} />
                            ) : (
                                <ProfileEdit
                                    profile={profile}
                                    isSelf={isSelf}
                                    isAdmin={isAdmin}
                                    onCancel={() => setMode('view')}
                                    onSave={() => {
                                        setMode('view')
                                        fetchProfile()
                                    }}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
