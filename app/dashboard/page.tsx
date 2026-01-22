"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
    Activity, Users, FileText, Briefcase,
    Bell, ChevronRight, Clock, Shield,
    CheckCircle, User, Terminal, ArrowRight, Zap
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { CaseStore, Case } from "@/lib/store/cases"
import { ReportStore, Report } from "@/lib/store/reports"
import { ActivityStore, Activity as ActivityLog } from "@/lib/store/activity"
import { getUsers } from "@/app/actions/user"
import { getAnnouncements } from "@/app/actions/announcements"

export default function DashboardPage() {
    const { data: session } = useSession()
    const { dict } = useTranslation()

    const [stats, setStats] = useState({
        activeDuty: 0,
        openCases: 0,
        closedCases: 0,
        pendingClosure: 0
    })
    const [userCases, setUserCases] = useState<Case[]>([])
    const [userReports, setUserReports] = useState<Report[]>([])
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [activities, setActivities] = useState<ActivityLog[]>([])

    useEffect(() => {
        if (!session?.user) return

        const fetchData = async () => {
            const allCases = CaseStore.getAll()
            const allReports = ReportStore.getAll()
            const allAnnouncements = await getAnnouncements()
            const allActivities = ActivityStore.getAll()
            const allUsers = await getUsers()

            // Stats logic
            const openStatuses = ['ASSIGNED', 'IN_PROGRESS', 'RETURNED']
            const openCount = allCases.filter(c => openStatuses.includes(c.status)).length
            const closedCount = allCases.filter(c => c.status === 'CLOSED').length
            const pendingCount = allCases.filter(c => c.status === 'PENDING_CLOSURE').length
            const activeCount = allUsers.filter(u => u.status === 'Active').length

            setStats({
                activeDuty: activeCount,
                openCases: openCount,
                closedCases: closedCount,
                pendingClosure: pendingCount
            })

            // User Cases
            const filteredCases = allCases.filter(c =>
                c.reportingOfficerId === session.user.id ||
                c.leadInvestigatorId === session.user.id ||
                c.participantIds.includes(session.user.id)
            ).slice(0, 5)
            setUserCases(filteredCases)

            // User Reports
            const filteredReports = allReports.filter(r =>
                r.authorId === session.user.id ||
                r.coAuthorIds.includes(session.user.id)
            ).slice(0, 5)
            setUserReports(filteredReports)

            // Announcements
            setAnnouncements(allAnnouncements.slice(0, 3))

            setActivities(allActivities.slice(0, 10))
        }

        fetchData()
    }, [session])

    const isAdmin = session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"

    return (
        <div className="animate-fade-in space-y-10 pb-12">
            {/* Header */}
            <header className="page-header bg-card border border-border p-8 rounded-md shadow-2xl backdrop-blur-md bg-opacity-95 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Terminal size={120} className="text-primary rotate-12" />
                </div>

                <div className="page-title-group relative z-10">
                    <h1 className="page-title italic !leading-none">
                        {dict.dashboard.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground uppercase tracking-[0.2em] font-black">
                        <div className="flex items-center gap-2">
                            <span className="text-primary/60">{dict.dashboard.node}:</span>
                            <span className="text-foreground border-b border-primary/20">{session?.user?.name?.toUpperCase()}</span>
                        </div>
                        <div className="hidden sm:block text-border">/</div>
                        <div className="flex items-center gap-2">
                            <span className="text-primary/60">{dict.dashboard.auth}:</span>
                            <span className="text-foreground border-b border-primary/20">{session?.user?.rank?.name}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-primary/5 px-6 py-3 rounded-lg border border-primary/10 shadow-inner group transition-all hover:bg-primary/10 hover:border-primary/30">
                    <div className="relative">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_12px_hsl(var(--primary)/0.6)]"></div>
                        <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-primary animate-ping opacity-40"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary">ENCRYPTED_TUNNEL</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Stability: UNINTERRUPTED</span>
                    </div>
                </div>
            </header>

            {/* Strategic Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: dict.dashboard.stats.active_duty, value: stats.activeDuty, icon: Users, color: "text-primary", bg: "bg-primary/5" },
                    { label: dict.dashboard.stats.open_cases, value: stats.openCases, icon: Briefcase, color: "text-primary", bg: "bg-primary/5" },
                    { label: dict.dashboard.stats.closed_cases, value: stats.closedCases, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/5" },
                    ...(isAdmin ? [{ label: dict.dashboard.stats.pending_closure, value: stats.pendingClosure, icon: Shield, color: "text-amber-500", bg: "bg-amber-500/5" }] : [])
                ].map((stat, i) => (
                    <div key={i} className={`bg-card border border-border p-7 rounded-md relative overflow-hidden group hover:border-primary/40 transition-all hover:translate-y-[-4px] shadow-xl hover:shadow-primary/10`}>
                        <div className="flex items-center justify-between mb-6">
                            <div className={`flex items-center gap-3 ${stat.color} font-black text-[12px] uppercase tracking-[0.2em]`}>
                                <stat.icon size={16} />
                                {stat.label}
                            </div>
                            <div className="opacity-10 group-hover:opacity-30 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12">
                                <stat.icon size={44} />
                            </div>
                        </div>
                        <div className="text-h1 text-foreground transition-all group-hover:tracking-tighter font-black">{stat.value}</div>
                        <div className="absolute bottom-0 left-0 h-1 bg-primary/40 w-0 group-hover:w-full transition-all duration-700 ease-in-out"></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:items-start">
                {/* Tactical Operations: Assignments & Reports */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Active Assignments */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-2xl group">
                        <div className="bg-muted/30 border-b border-border p-5 flex items-center justify-between relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/50 transition-colors"></div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                                    <Briefcase size={18} />
                                </div>
                                <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.dashboard.assignments.title}</h3>
                            </div>
                            <Link href="/dashboard/cases" className="group/link text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded border border-transparent hover:border-primary/20">
                                {dict.dashboard.assignments.view_all} <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="divide-y divide-border">
                            {userCases.length > 0 ? (
                                userCases.map(c => (
                                    <Link key={c.id} href={`/dashboard/cases/${c.id}`} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-primary/5 transition-all group/item gap-6 relative overflow-hidden">
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="shrink-0 w-12 h-12 bg-muted border border-border rounded-lg flex items-center justify-center text-primary group-hover/item:border-primary/40 group-hover/item:bg-primary/5 transition-all shadow-sm">
                                                <Briefcase size={24} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[15px] font-black uppercase tracking-tight text-foreground group-hover/item:text-primary transition-colors leading-none italic">{c.title}</div>
                                                <div className="text-[11px] text-primary/80 font-mono font-black tracking-widest uppercase leading-none">REF_ID: {c.caseId}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10 text-right self-end sm:self-auto relative z-10">
                                            <div className="space-y-2">
                                                <div className="text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em] opacity-40">{dict.dashboard.table.status}</div>
                                                <div className={`text-[10px] font-black uppercase px-3 py-1 rounded-[2px] border ${c.status === 'RETURNED' ? 'bg-destructive/10 border-destructive/30 text-destructive' : 'bg-primary/10 border-primary/30 text-primary'
                                                    } shadow-sm`}>
                                                    {c.status.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <div className="hidden md:block space-y-2">
                                                <div className="text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em] opacity-40">{dict.dashboard.table.updated}</div>
                                                <div className="text-[12px] text-foreground font-mono font-black uppercase tracking-tighter">{new Date(c.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/5 to-transparent translate-x-full group-hover/item:translate-x-0 transition-transform duration-500 ease-out"></div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center gap-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                    <Briefcase size={48} strokeWidth={1} className="text-muted-foreground" />
                                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.4em] italic leading-relaxed">
                                        {dict.dashboard.assignments.no_cases}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Recent Intelligence Reports */}
                    <section className="bg-card border border-border rounded-md overflow-hidden shadow-2xl group">
                        <div className="bg-muted/30 border-b border-border p-5 flex items-center justify-between relative">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary/50 transition-colors"></div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                                    <FileText size={18} />
                                </div>
                                <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.dashboard.recent_reports.title}</h3>
                            </div>
                            <Link href="/dashboard/reports" className="group/link text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded border border-transparent hover:border-primary/20">
                                {dict.dashboard.recent_reports.view_all} <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="divide-y divide-border">
                            {userReports.length > 0 ? (
                                userReports.map(r => (
                                    <Link key={r.id} href={`/dashboard/reports/${r.id}`} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-primary/5 transition-all group/item gap-6 relative overflow-hidden">
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="shrink-0 w-12 h-12 bg-muted border border-border rounded-lg flex items-center justify-center text-primary group-hover/item:border-primary/40 group-hover/item:bg-primary/5 transition-all shadow-sm">
                                                <FileText size={24} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="text-[15px] font-black uppercase tracking-tight text-foreground group-hover/item:text-primary transition-colors leading-none italic">{r.title}</div>
                                                <div className="text-[10px] text-primary/70 font-mono font-black tracking-widest uppercase leading-none opacity-60">{r.reportNumber}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-10 text-right self-end sm:self-auto relative z-10">
                                            <div className="space-y-2">
                                                <div className="text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em] opacity-40">{dict.dashboard.table.status}</div>
                                                <div className="text-[10px] font-black uppercase px-3 py-1 rounded-[2px] border border-primary/30 bg-primary/10 text-primary shadow-sm">
                                                    {r.status.replace(/_/g, ' ')}
                                                </div>
                                            </div>
                                            <div className="hidden md:block space-y-2">
                                                <div className="text-[9px] uppercase text-muted-foreground font-black tracking-[0.2em] opacity-40">{dict.dashboard.table.submitted}</div>
                                                <div className="text-[12px] text-foreground font-mono font-black uppercase tracking-tighter">{r.submittedAt ? new Date(r.submittedAt).toLocaleDateString() : "---"}</div>
                                            </div>
                                        </div>
                                        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-primary/5 to-transparent translate-x-full group-hover/item:translate-x-0 transition-transform duration-500 ease-out"></div>
                                    </Link>
                                ))
                            ) : (
                                <div className="p-20 text-center flex flex-col items-center gap-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                    <FileText size={48} strokeWidth={1} className="text-muted-foreground" />
                                    <p className="text-[11px] text-muted-foreground font-black uppercase tracking-[0.4em] italic leading-relaxed">
                                        {dict.dashboard.recent_reports.no_reports}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>

                {/* Right Profile: Alerts & Operational Feed */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Fleet Announcements */}
                    <aside className="bg-card border border-border rounded-md overflow-hidden shadow-2xl relative group">
                        <div className="bg-muted/30 border-b border-border p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-primary" />
                                <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.dashboard.announcements.title}</h3>
                            </div>
                            <Link href="/dashboard/announcements" className="group/link text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all flex items-center gap-2 px-3 py-1.5 bg-muted/40 rounded border border-transparent hover:border-primary/20">
                                {dict.dashboard.announcements_preview.view_all} <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <div className="p-6 space-y-4">
                            {announcements.length > 0 ? announcements.map(a => (
                                <Link key={a.id} href="/dashboard/announcements" className={`block p-5 rounded border transition-all ${a.isPinned ? 'bg-primary/5 border-primary/20 shadow-xl' : 'bg-muted/20 border-border/50 hover:border-primary/30'} relative group/note`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="text-[13px] font-black text-foreground uppercase tracking-tight leading-tight group-hover/note:text-primary transition-colors">{a.title}</div>
                                        {a.isPinned && <Zap size={14} className="text-primary shrink-0 animate-pulse" />}
                                    </div>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed mb-6 font-medium line-clamp-2 italic">
                                        {a.body}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-primary/60 font-black uppercase italic tracking-[0.2em] border-t border-primary/10 pt-4">
                                        <span className="flex items-center gap-2"><User size={12} className="opacity-50" /> {a.author.lastName}</span>
                                        <span className="flex items-center gap-2"><Clock size={12} className="opacity-50" /> {new Date(a.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {a.isPinned && <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent pointer-events-none"></div>}
                                </Link>
                            )) : (
                                <div className="text-center py-10 opacity-30 italic text-[11px] font-black uppercase tracking-widest">{dict.announcements.no_announcements}</div>
                            )}
                            <Link href="/dashboard/announcements" className="block w-full mt-2 py-3 bg-muted/50 rounded-md text-[10px] font-black uppercase tracking-[0.3em] text-center text-muted-foreground hover:bg-muted hover:text-primary transition-all border border-border/60 active:scale-[0.98]">
                                {dict.dashboard.announcements.archive}
                            </Link>
                        </div>
                    </aside>

                    {/* Operational Activity Log */}
                    <aside className="bg-card border border-border rounded-md overflow-hidden shadow-2xl relative group">
                        <div className="bg-muted/30 border-b border-border p-5 flex items-center gap-3">
                            <Activity size={18} className="text-primary" />
                            <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">{dict.dashboard.activity.title}</h3>
                        </div>
                        <div className="p-8">
                            <div className="space-y-8 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[px] before:bg-border/50 border-l border-border/40">
                                {activities.length > 0 ? (
                                    activities.map(act => (
                                        <div key={act.id} className="relative pl-7 group/act">
                                            <div className="absolute left-[-5px] top-1.5 w-[9px] h-[9px] bg-background border-2 border-primary/40 rounded-full flex items-center justify-center group-hover/act:border-primary transition-colors">
                                                <div className="w-[3px] h-[3px] bg-primary rounded-full group-hover/act:scale-150 transition-transform"></div>
                                            </div>
                                            <div className="text-[12px] text-foreground/90 uppercase leading-snug tracking-tight">
                                                <span className="text-primary font-black italic tracking-tight group-hover/act:underline decoration-primary/30 underline-offset-4 transition-all">{act.userName}</span>
                                                <span className="mx-2 text-muted-foreground/60 font-black text-[10px] uppercase tracking-widest">{act.type.replace(/_/g, ' ')}</span>
                                                {act.targetTitle && <span className="text-foreground font-black tracking-tighter">"{act.targetTitle}"</span>}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground/40 font-mono tracking-tighter uppercase font-black">
                                                <Clock size={12} className="opacity-30" /> {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 flex flex-col items-center gap-4 opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                                        <Activity size={32} className="text-muted-foreground" />
                                        <div className="text-[11px] text-muted-foreground uppercase font-black italic tracking-[0.3em]">
                                            {dict.dashboard.activity.monitoring}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                    </aside>
                </div>
            </div>
        </div>
    )
}
