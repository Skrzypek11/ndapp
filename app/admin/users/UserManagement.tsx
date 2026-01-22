"use client"

import { useState } from "react"
import { createUser } from "@/app/actions/user"
import { UserPlus, X, Shield, Activity, Users, Search, Filter, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"

export default function UserManagement({ users, ranks }: { users: any[], ranks: any[] }) {
    const { dict } = useTranslation()
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCreate = async (formData: FormData) => {
        setLoading(true)
        const res = await createUser(formData)
        setLoading(false)

        if (res.success) {
            setShowForm(false)
            router.refresh()
        } else {
            alert(res.error)
        }
    }

    return (
        <div className="animate-fade-in space-y-6 pb-12">
            {/* Command Header */}
            <header className="page-header bg-card border border-border p-6 rounded-md shadow-xl backdrop-blur-md bg-opacity-95">
                <div className="page-title-group">
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/70">
                            {dict.sidebar.admin}
                        </span>
                        <span className="text-border">/</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] font-black text-foreground">
                            {dict.admin.users.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-primary/20 rounded flex items-center justify-center text-primary border border-primary/30 shadow-inner group">
                            <Users size={28} className="group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                            <h1 className="page-title !italic !leading-none mb-1">
                                {dict.admin.users.title}
                            </h1>
                            <p className="page-subtitle leading-none flex items-center gap-2">
                                <Shield size={10} className="text-primary" /> RESTRICTED ADMINISTRATIVE NODE :: ACCESS LEVEL 5
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        className={showForm ? "btn-secondary !text-destructive !border-destructive/30" : "btn-primary"}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? <X size={16} /> : <UserPlus size={16} />}
                        {showForm ? dict.admin.users.cancel : dict.admin.users.add_agent}
                    </button>
                </div>
            </header>

            {/* Creation Form */}
            {showForm && (
                <div className="card-container p-8 relative overflow-hidden animate-scale-in">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/40"></div>
                    <form action={handleCreate} className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-border pb-4 mb-6">
                            <UserPlus size={18} className="text-primary" />
                            <h2 className="text-small font-black uppercase tracking-[0.2em] text-foreground">Enlist New Operational Asset</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { name: "rpName", label: dict.admin.users.fields.rp_name, placeholder: dict.admin.users.placeholders.rp_name },
                                { name: "email", label: dict.admin.users.fields.email, type: "email", placeholder: dict.admin.users.placeholders.email },
                                { name: "password", label: dict.admin.users.fields.password, type: "password", placeholder: dict.admin.users.placeholders.password },
                                { name: "badgeNumber", label: dict.admin.users.fields.badge, placeholder: dict.admin.users.placeholders.badge },
                                { name: "phoneNumber", label: dict.admin.users.fields.phone, placeholder: dict.admin.users.placeholders.phone }
                            ].map((field) => (
                                <div key={field.name} className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors pl-1">
                                        {field.label}
                                    </label>
                                    <input
                                        name={field.name}
                                        type={field.type || "text"}
                                        required={field.name !== "phoneNumber"}
                                        className="w-full bg-muted/20 border border-border rounded px-4 py-3 text-small font-bold text-foreground focus:outline-none focus:border-primary focus:bg-muted/40 transition-all placeholder:text-muted-foreground/20"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-focus-within:text-primary transition-colors pl-1">
                                    {dict.admin.users.fields.rank}
                                </label>
                                <select
                                    name="rankId"
                                    required
                                    className="w-full bg-muted/20 border border-border rounded px-4 py-3 text-small font-bold text-foreground focus:outline-none focus:border-primary focus:bg-muted/40 transition-all appearance-none cursor-pointer uppercase tracking-tight"
                                >
                                    {ranks.map(r => (
                                        <option key={r.id} value={r.id} className="bg-card text-foreground">{r.name} [{r.systemRole}]</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end pt-6 border-t border-border">
                            <button
                                type="submit"
                                className="btn-primary !px-10 !py-3.5"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                                        {dict.admin.users.processing}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Activity size={16} />
                                        {dict.admin.users.submit}
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Assets Table */}
            <div className="card-container">
                <div className="bg-muted/20 border-b border-border p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-primary/60" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Active Intelligence Assets</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="data-table-thead">
                            <tr>
                                <th className="data-table-th">{dict.admin.users.table.agent}</th>
                                <th className="data-table-th">{dict.admin.users.table.badge}</th>
                                <th className="data-table-th">{dict.admin.users.table.rank}</th>
                                <th className="data-table-th">{dict.admin.users.table.role}</th>
                                <th className="data-table-th">{dict.admin.users.table.contact}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.map(user => (
                                <tr key={user.id} className="data-table-tr group">
                                    <td className="data-table-td">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img
                                                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.rpName}&background=0D8ABC&color=fff`}
                                                    className="w-10 h-10 rounded-md border border-border object-cover group-hover:border-primary/40 transition-colors shadow-sm"
                                                    alt=""
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-card rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-small font-black uppercase tracking-tight text-foreground group-hover:text-primary transition-colors">{user.rpName}</span>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase font-mono tracking-widest mt-0.5">ID: {user.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="data-table-td">
                                        <span className="text-mono-data text-primary px-3 py-1 bg-primary/10 rounded border border-primary/20 text-[11px] font-black tracking-tight">{user.badgeNumber}</span>
                                    </td>
                                    <td className="data-table-td">
                                        <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80">{user.rank.name}</span>
                                    </td>
                                    <td className="data-table-td">
                                        <span className={`status-badge ${user.rank.systemRole === "ROOT" || user.rank.systemRole === "ADMIN"
                                            ? "status-badge-approved"
                                            : "status-badge-draft"
                                            }`}>
                                            {user.rank.systemRole}
                                        </span>
                                    </td>
                                    <td className="data-table-td">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[11px] font-semibold text-foreground/70 uppercase tracking-tight">{user.email}</span>
                                            {user.phoneNumber && <span className="text-[9px] text-muted-foreground font-mono">{user.phoneNumber}</span>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
