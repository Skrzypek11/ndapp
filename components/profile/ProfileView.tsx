"use client"

import { useTranslation } from "@/lib/i18n"
import { Shield, BadgeCheck, Phone, Mail, Calendar, Activity, BookOpen, FileText, Briefcase, User2 } from "lucide-react"

interface ProfileViewProps {
    profile: any
    isSelf: boolean
    isAdmin: boolean
}

export default function ProfileView({ profile, isSelf, isAdmin }: ProfileViewProps) {
    const { dict } = useTranslation()

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'text-primary'
            case 'Leave': return 'text-yellow-500'
            case 'Rest': return 'text-orange-500'
            case 'Suspended': return 'text-destructive'
            default: return 'text-muted-foreground'
        }
    }

    const SectionHeader = ({ title }: { title: string }) => (
        <div className="flex items-center gap-4 mb-4">
            <h3 className="text-[11px] font-black uppercase tracking-[.3em] text-primary/60 whitespace-nowrap">{title}</h3>
            <div className="h-px w-full bg-gradient-to-r from-primary/20 to-transparent" />
        </div>
    )

    const InfoItem = ({ label, value, icon: Icon }: any) => (
        <div className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0 group">
            <div className="flex items-center gap-3">
                <Icon size={14} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-tight text-foreground">{value || "---"}</span>
        </div>
    )

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Identity Block */}
            <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative group">
                    <div className="w-32 h-32 bg-muted border-2 border-primary/20 overflow-hidden rounded-lg shadow-2xl transition-transform duration-300 group-hover:scale-105">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/5">
                                <User2 size={48} className="text-primary/20" />
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D0F0F] border border-border/50 text-[9px] font-black uppercase tracking-widest ${getStatusColor(profile.status)} shadow-lg`}>
                            <span className="w-2 h-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
                            {profile.status}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-foreground">{profile.rpName}</h1>
                    <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[.3em] text-primary/80">
                        <span className="flex items-center gap-1.5">
                            <BadgeCheck size={14} /> {profile.badgeNumber}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-border" />
                        <span className="flex items-center gap-1.5">
                            <Shield size={14} /> {profile.rank?.name}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                {/* Section: Contact */}
                <section className="space-y-2">
                    <SectionHeader title="Dane kontaktowe" />
                    <div className="space-y-1">
                        <InfoItem label="Telefon" value={profile.phoneNumber} icon={Phone} />
                        <InfoItem label="Email" value={profile.email} icon={Mail} />
                    </div>
                </section>

                {/* Section: Assignment */}
                <section className="space-y-2">
                    <SectionHeader title="Przydział / Jednostka / Role" />
                    <div className="space-y-1">
                        <InfoItem label="Jednostka" value={profile.unitAssignment || "Unassigned"} icon={Activity} />
                        <InfoItem label="Data dołączenia" value={new Date(profile.createdAt).toLocaleDateString()} icon={Calendar} />
                        <InfoItem label="Ostatnia aktywność" value={profile.lastActive ? new Date(profile.lastActive).toLocaleString() : "Recently"} icon={Shield} />
                    </div>
                </section>

                {/* Section: Activity */}
                <section className="md:col-span-2 space-y-4">
                    <SectionHeader title="Aktywność Operacyjna" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Raporty napisane", value: profile.stats?.reportsAuthored ?? 0, icon: FileText },
                            { label: "Współautorstwo", value: profile.stats?.reportsCoAuthored ?? 0, icon: BookOpen },
                            { label: "Aktywne sprawy", value: profile.stats?.activeCases ?? 0, icon: Briefcase },
                            { label: "Zamknięte sprawy", value: profile.stats?.closedCases ?? 0, icon: Activity },
                        ].map((stat, i) => (
                            <div key={i} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-lg flex flex-col items-center text-center gap-2 group hover:border-primary/20 transition-all">
                                <stat.icon size={18} className="text-primary/30 group-hover:text-primary transition-colors" />
                                <div className="text-2xl font-black text-foreground">{stat.value}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Optional Notes & Certs */}
                {(profile.certifications || profile.notes) && (
                    <section className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {profile.certifications && (
                            <div className="space-y-3">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <BadgeCheck size={12} /> Certyfikaty i Szkolenia
                                </h4>
                                <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded italic text-xs text-muted-foreground/80 leading-relaxed">
                                    {profile.certifications}
                                </div>
                            </div>
                        )}
                        {profile.notes && (
                            <div className="space-y-3">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                    <FileText size={12} /> Notatki Służbowe
                                </h4>
                                <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded italic text-xs text-muted-foreground/80 leading-relaxed">
                                    {profile.notes}
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    )
}
