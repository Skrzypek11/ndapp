"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
    Mail,
    Lock,
    ArrowRight,
    AlertTriangle,
    MapPin,
    Clock,
    Shield,
    Terminal,
    Activity,
    LifeBuoy
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"

export default function LoginPage() {
    const { dict, language } = useTranslation()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [currentTime, setCurrentTime] = useState("")
    const router = useRouter()

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString(language === 'pl' ? 'pl-PL' : 'en-US', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }))
        }, 1000)
        return () => clearInterval(timer)
    }, [language])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password
            })

            if (res?.error) {
                setError(dict.auth.error_auth)
            } else {
                router.push("/dashboard")
            }
        } catch (err) {
            setError(dict.auth.error_system)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#050705]">
            {/* Cinematic Background Layer */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0a0f0a] to-black opacity-90" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 contrast-150 brightness-50" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.05)_0%,transparent_70%)] animate-pulse" />

                {/* Scanlines Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]" />
            </div>

            <div className="relative z-20 w-full max-w-lg px-6 animate-fade-in py-12">
                {/* Header / Branding */}
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg border border-primary/30 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <img src="/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground leading-none">{dict.auth.title}</span>
                            <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/70 mt-1">{dict.auth.subtitle}</span>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest bg-muted/20 px-3 py-1.5 rounded border border-border/50">
                        <LifeBuoy size={14} />
                    </button>
                </div>

                {/* Main Auth Card */}
                <div className="bg-card/40 backdrop-blur-2xl border border-border/40 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_hsl(var(--primary)/0.3)]" />

                    <div className="p-10 space-y-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">
                                {dict.auth.secure_login}
                            </h1>
                            <div className="flex items-center justify-center gap-2">
                                <span className="h-[1px] w-8 bg-primary/30" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 italic">Node Access Protocol</span>
                                <span className="h-[1px] w-8 bg-primary/30" />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md flex items-center gap-3 animate-shake">
                                <AlertTriangle className="text-destructive shrink-0" size={18} />
                                <p className="text-[11px] font-bold text-destructive uppercase tracking-wide">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors pl-1">
                                    {dict.auth.email}
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="email"
                                        className="w-full bg-muted/10 border border-border/40 rounded-lg px-12 py-4 text-small font-bold text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/20 transition-all placeholder:text-muted-foreground/10"
                                        placeholder={dict.auth.placeholder_email}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors pl-1">
                                    {dict.auth.password}
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="password"
                                        className="w-full bg-muted/10 border border-border/40 rounded-lg px-12 py-4 text-small font-bold text-foreground focus:outline-none focus:border-primary/50 focus:bg-muted/20 transition-all placeholder:text-muted-foreground/10"
                                        placeholder={dict.auth.placeholder_password}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-lg font-black uppercase tracking-[0.2em] text-[12px] transition-all shadow-xl shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-wait group relative overflow-hidden"
                            >
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                                            {dict.auth.verifying}
                                        </>
                                    ) : (
                                        <>
                                            {dict.auth.login_btn}
                                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            </button>
                        </form>

                        <div className="bg-destructive/5 border border-destructive/20 p-5 rounded-lg flex items-start gap-4">
                            <div className="w-10 h-10 bg-destructive/10 rounded flex items-center justify-center text-destructive border border-destructive/20 shrink-0">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-[11px] font-black uppercase text-destructive tracking-widest">{dict.auth.warning_title}</h3>
                                <p className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-wide leading-relaxed">
                                    {dict.auth.warning_text}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-muted/10 border-t border-border/40 p-5 flex items-center justify-between px-8">
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            <MapPin size={12} className="text-primary/40" />
                            {dict.auth.footer_location}
                        </div>
                        <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">
                            <Clock size={12} className="text-primary/40" />
                            {dict.auth.footer_time}: <span className="text-foreground/60 font-mono italic">{currentTime}</span>
                        </div>
                    </div>
                </div>

                {/* Tactical Footer Meta */}
                <footer className="mt-8 flex items-center justify-between px-2">
                    <div className="flex items-center gap-6 text-[8px] font-black text-muted-foreground/30 uppercase tracking-[0.3em]">
                        <span>TERMINAL_ID: <span className="text-primary/40">ND-77-DELTA</span></span>
                        <span>NODE_STATUS: <span className="text-green-500/40">ONLINE</span></span>
                        <span>ENC: <span className="text-primary/40">AES-256-GCM</span></span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--primary)/0.5)]"></div>
                        <div className="w-1.5 h-1.5 bg-primary/20 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-primary/10 rounded-full"></div>
                    </div>
                </footer>
            </div>

            {/* Version Tag */}
            <div className="absolute bottom-6 right-8 text-[9px] font-black text-primary/20 uppercase tracking-[0.5em] italic">
                v4.3.0-secure-intel
            </div>
        </div>
    )
}
