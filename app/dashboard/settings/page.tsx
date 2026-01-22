"use client"

import { useSession } from "next-auth/react"
import { useTranslation } from "@/lib/i18n"
import ThemeToggle from "@/components/settings/ThemeToggle"
import LanguageSwitcher from "@/components/settings/LanguageSwitcher"
import { User, Palette, Globe, Lock, Settings, Shield, Activity, Terminal, AlertTriangle } from "lucide-react"

export default function SettingsPage() {
    const { data: session } = useSession()
    const { dict, language } = useTranslation()
    const user = session?.user

    if (!session) return (
        <div className="p-8 flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">{dict.common.loading}</p>
            </div>
        </div>
    )

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            {/* Command Header */}
            <header className="bg-card border border-border p-6 rounded-md shadow-xl backdrop-blur-md bg-opacity-95">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/70">
                                {dict.sidebar.system}
                            </span>
                            <span className="text-border">/</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground">
                                {dict.settings.title}
                            </span>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-primary/20 rounded flex items-center justify-center text-primary border border-primary/30 shadow-inner group">
                                <Settings size={28} className="group-hover:rotate-90 transition-transform duration-700" />
                            </div>
                            <div>
                                <h1 className="text-h1 text-foreground leading-none mb-1 uppercase italic tracking-tight font-black">
                                    {dict.settings.title}
                                </h1>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono leading-none flex items-center gap-2">
                                    <Terminal size={10} className="text-primary" /> LOCAL_CONFIG_NODE :: {user?.name?.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Status: Secured</span>
                            <span className="text-[8px] text-muted-foreground uppercase tracking-widest mt-1">Enc: AES-256-GCM</span>
                        </div>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Interface Configuration */}
                <div className="space-y-8">
                    {/* Appearance Section */}
                    <section className="bg-card border border-border rounded-md p-8 shadow-xl space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
                        <div className="flex items-center gap-4 border-b border-border pb-5">
                            <Palette size={20} className="text-primary" />
                            <h2 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.settings.appearance.title}</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 pl-1">
                                <Activity size={12} /> {dict.settings.appearance.theme_label}
                            </label>
                            <ThemeToggle />
                        </div>
                    </section>

                    {/* Language Section */}
                    <section className="bg-card border border-border rounded-md p-8 shadow-xl space-y-8 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
                        <div className="flex items-center gap-4 border-b border-border pb-5">
                            <Globe size={20} className="text-primary" />
                            <h2 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.settings.language.title}</h2>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 pl-1">
                                <Activity size={12} /> {dict.settings.language.select_language}
                            </label>
                            <LanguageSwitcher />
                        </div>
                    </section>
                </div>

                {/* Account Section */}
                <section className="bg-card border border-border rounded-md p-8 shadow-xl space-y-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1 h-full bg-primary/20 group-hover:bg-primary/40 transition-colors"></div>
                    <div className="flex items-center gap-4 border-b border-border pb-5">
                        <Shield size={20} className="text-primary" />
                        <h2 className="text-small font-black uppercase tracking-[0.2em] text-foreground">{dict.settings.account.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
                        {[
                            { label: dict.settings.account.rp_name, value: user?.name, type: 'text' },
                            { label: dict.settings.account.badge, value: user?.badgeNumber, type: 'mono' },
                            { label: dict.settings.account.rank, value: user?.rank?.name, type: 'uppercase' },
                            { label: dict.settings.account.email, value: user?.email, type: 'text' },
                        ].map((field) => (
                            <div key={field.label} className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">{field.label}</label>
                                <div className={`text-small font-black uppercase tracking-tight ${field.type === 'mono' ? 'text-primary font-mono' :
                                    field.type === 'uppercase' ? 'text-muted-foreground' : 'text-foreground'
                                    }`}>
                                    {field.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-10 border-t border-border/50 space-y-8">
                        <div className="flex items-center gap-3">
                            <Lock size={16} className="text-primary/60" />
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground">
                                {dict.settings.account.change_password_header}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-40 grayscale cursor-not-allowed">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dict.settings.account.current_password}</label>
                                <div className="w-full bg-muted/30 border border-border rounded px-4 py-3 text-small font-bold">••••••••</div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{dict.settings.account.new_password}</label>
                                <div className="w-full bg-muted/30 border border-border rounded px-4 py-3 text-small font-bold">••••••••</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button className="bg-primary/20 text-primary-foreground/40 px-8 py-3 rounded-md text-[10px] font-black uppercase tracking-[0.2em] cursor-not-allowed border border-primary/10" disabled>
                                {dict.settings.account.update_password}
                            </button>
                            <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 p-4 rounded-md">
                                <AlertTriangle size={16} className="text-destructive shrink-0" />
                                <p className="text-[9px] text-destructive font-black uppercase tracking-widest italic leading-relaxed">
                                    {language === 'pl' ? "Hasła są zarządzane przez dowództwo w kwaterze głównej." : "Password updates are managed at Central Command and require Level 5 clearance."}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
