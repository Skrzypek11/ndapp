"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import {
    LayoutDashboard,
    Users,
    FileText,
    Briefcase,
    Shield,
    LogOut,
    Settings,
    Activity,
    Bell,
    BookOpen,
    Menu,
    X
} from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { useProfileStore } from "@/lib/store/profile"
import { getUnreadCount } from "@/app/actions/announcements"

export default function Sidebar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const { openProfile } = useProfileStore()
    const user = session?.user
    const [unreadCount, setUnreadCount] = useState(0)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    useEffect(() => {
        if (user?.id) {
            getUnreadCount().then(setUnreadCount)
        }
    }, [user?.id, pathname])

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    const links = [
        { name: dict.sidebar.dashboard, href: "/dashboard", icon: LayoutDashboard },
        { name: dict.sidebar.roster, href: "/dashboard/roster", icon: Users },
        { name: dict.sidebar.reports, href: "/dashboard/reports", icon: FileText },
        { name: dict.sidebar.cases, href: "/dashboard/cases", icon: Briefcase },
        { name: dict.sidebar.announcements, href: "/dashboard/announcements", icon: Bell, badge: unreadCount },
        { name: dict.sidebar.kompendium, href: "/dashboard/kompendium", icon: BookOpen },
    ]

    const adminLinks = [
        { name: dict.sidebar.users, href: "/admin/users", icon: Users },
    ]

    const settingsLink = { name: dict.sidebar.settings, href: "/dashboard/settings", icon: Settings }

    const isActive = (path: string) => pathname === path

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-background/80 border border-border/50 rounded-md shadow-lg backdrop-blur-md text-primary"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside className={`
                w-64 h-screen fixed left-0 top-0 bg-background border-r border-border flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.2)]
                transition-transform duration-300 ease-in-out
                ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
                lg:translate-x-0
            `}>
                {/* Header / Brand */}
                <div className="p-5 border-b border-border flex flex-col items-center gap-4 bg-muted/20 backdrop-blur-sm relative">
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden absolute top-4 right-4 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="w-28 h-28 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-center shadow-[inset_0_0_20px_rgba(var(--primary),0.05)] group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <img
                            src="/images/logo.png"
                            alt="Logo"
                            className="w-20 h-20 object-contain group-hover:scale-110 transition-transform duration-700 ease-out drop-shadow-[0_0_12px_rgba(var(--primary),0.4)]"
                        />
                    </div>
                    <div className="flex flex-col items-center text-center">
                        <span className="text-[16px] font-black uppercase tracking-[0.2em] text-foreground leading-none drop-shadow-sm">Narcotic Div.</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mt-1.5 opacity-80">Intell Terminal</span>
                        <div className="w-10 h-0.5 bg-primary/30 mt-3 rounded-full"></div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar flex flex-col">
                    <div className="flex-1">
                        <div className="px-3 mb-2 mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{dict.sidebar.operations}</div>
                        {links.map((link) => {
                            const Icon = link.icon
                            const active = isActive(link.href)
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all group border ${active
                                        ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                                        : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                        }`}
                                >
                                    <Icon size={18} className={`${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"} transition-colors`} />
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                                        {link.name}
                                    </span>
                                    {link.badge !== undefined && link.badge > 0 && (
                                        <span className="ml-auto px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-black rounded-sm shadow-[0_0_10px_rgba(var(--primary),0.3)] animate-pulse">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            )
                        })}

                        {/* Admin Section */}
                        {(user?.rank?.systemRole === "ADMIN" || user?.rank?.systemRole === "ROOT") && (
                            <>
                                <div className="px-3 mb-2 mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{dict.sidebar.admin}</div>
                                {adminLinks.map((link) => {
                                    const Icon = link.icon
                                    const active = isActive(link.href)
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all group border ${active
                                                ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                                                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                                }`}
                                        >
                                            <Icon size={18} className={`${active ? "text-primary" : "text-muted-foreground group-hover:text-primary"} transition-colors`} />
                                            <span className={`text-[11px] font-black uppercase tracking-widest ${active ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>
                                                {link.name}
                                            </span>
                                        </Link>
                                    )
                                })}
                            </>
                        )}
                    </div>

                    <div className="mt-auto pt-4">
                        <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">{dict.sidebar.system}</div>
                        <Link
                            href={settingsLink.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded transition-all group border ${isActive(settingsLink.href)
                                ? "bg-primary/10 border-primary/20 text-primary shadow-sm"
                                : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                }`}
                        >
                            <Settings size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-[11px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">
                                {settingsLink.name}
                            </span>
                        </Link>
                    </div>
                </nav>

                {/* User Profile / Status */}
                <div className="p-3 border-t border-border bg-muted/10">
                    <div
                        onClick={() => user?.id && openProfile(user.id)}
                        className="flex items-center gap-2.5 p-2.5 bg-background border border-border rounded-md shadow-md group hover:border-primary/40 transition-all cursor-pointer"
                    >
                        <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-md overflow-hidden bg-muted border border-border">
                                <img
                                    src={user?.image || `https://ui-avatars.com/api/?name=${user?.name || "Agent"}&background=0D8ABC&color=fff`}
                                    alt="User"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-primary border-2 border-background rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-[11px] font-black uppercase tracking-tight text-foreground truncate">{user?.name || "Agent UNKNOWN"}</div>
                            <div className="text-[9px] font-bold uppercase tracking-widest text-primary/80 truncate">{user?.rank?.name || dict.sidebar.user_loading}</div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-all border border-transparent hover:border-destructive/30"
                            title={dict.sidebar.logout}
                        >
                            <LogOut size={15} />
                        </button>
                    </div>
                    <div className="mt-2.5 px-2 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
                        <span>Terminal node active</span>
                        <span className="flex items-center gap-1"><Activity size={9} /> 4.2ms</span>
                    </div>
                </div>
            </aside>
        </>
    )
}
