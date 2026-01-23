"use client"

import { useState, useMemo } from "react"
import { useTranslation } from "@/lib/i18n"
import { useProfileStore } from "@/lib/store/profile"
import { Search, ChevronDown, ChevronUp, Phone, BadgeCheck, Shield } from "lucide-react"

interface User {
    id: string;
    rpName: string;
    badgeNumber: string;
    phoneNumber?: string | null;
    avatarUrl?: string | null;
    status: string;
    rank: {
        name: string;
        order: number;
    }
}

interface RosterTableProps {
    users: User[];
}

type SortField = 'name' | 'badge' | 'rank';
type SortOrder = 'asc' | 'desc';

export default function RosterTable({ users }: RosterTableProps) {
    const { dict } = useTranslation()
    const { openProfile } = useProfileStore()
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("All")
    const [sortField, setSortField] = useState<SortField>('rank')
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

    const getInitials = (name: string) => {
        const parts = name.split(" ")
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase()
        }
        return name[0]?.toUpperCase() || "?"
    }

    const getAvatarColor = (name: string) => {
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        const c = (hash & 0x00FFFFFF).toString(16).toUpperCase()
        return "#" + "00000".substring(0, 6 - c.length) + c
    }

    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                const matchesSearch =
                    user.rpName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    user.badgeNumber.includes(searchQuery)
                const matchesStatus = statusFilter === "All" || user.status === statusFilter
                return matchesSearch && matchesStatus
            })
            .sort((a, b) => {
                let comparison = 0
                if (sortField === 'name') {
                    comparison = a.rpName.localeCompare(b.rpName)
                } else if (sortField === 'badge') {
                    comparison = parseInt(a.badgeNumber) - parseInt(b.badgeNumber)
                } else if (sortField === 'rank') {
                    comparison = a.rank.order - b.rank.order
                }
                return sortOrder === 'asc' ? comparison : -comparison
            })
    }, [users, searchQuery, statusFilter, sortField, sortOrder])

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortField(field)
            setSortOrder('asc')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'var(--primary)'
            case 'Standby': return '#eab308'
            case 'Leave': return '#3b82f6'
            case 'Suspended': return 'var(--destructive)'
            default: return 'var(--muted-foreground)'
        }
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-card p-4 rounded-md border border-border shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder={dict.roster.search_placeholder}
                        className="w-full bg-muted/30 border border-border rounded-md px-10 py-2.5 text-small font-semibold uppercase tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">{dict.roster.status_filter}</label>
                    <select
                        className="w-full md:w-auto bg-muted/30 border border-border rounded-md px-4 py-2.5 text-small font-semibold uppercase tracking-wider text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">{dict.roster.status_types.all}</option>
                        <option value="Active">{dict.roster.status_types.active}</option>
                        <option value="Standby">{dict.roster.status_types.standby}</option>
                        <option value="Leave">{dict.roster.status_types.leave}</option>
                        <option value="Suspended">{dict.roster.status_types.suspended}</option>
                    </select>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                        <div
                            key={user.id}
                            onClick={() => openProfile(user.id)}
                            className="bg-card border border-border rounded-lg p-5 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {user.avatarUrl ? (
                                            <img src={user.avatarUrl} className="w-12 h-12 object-cover rounded-full border-2 border-border" alt="" />
                                        ) : (
                                            <div
                                                className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-border text-sm font-black text-foreground"
                                                style={{ backgroundColor: getAvatarColor(user.rpName) + "20" }}
                                            >
                                                {getInitials(user.rpName)}
                                            </div>
                                        )}
                                        <div
                                            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-background"
                                            style={{ backgroundColor: getStatusColor(user.status) }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-small font-black uppercase tracking-tight text-foreground leading-none mb-1">{user.rpName}</h3>
                                        <div className="flex items-center gap-2 text-primary font-mono text-[11px] font-bold">
                                            <BadgeCheck size={12} /> {user.badgeNumber}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                                    {user.rank.name}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-3">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Status</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: getStatusColor(user.status) }}>
                                        {user.status === 'Active' ? dict.roster.status_types.active.split(' / ')[0] : user.status}
                                    </span>
                                </div>
                                <div className="space-y-1 text-right">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest block">Contact</span>
                                    <div className="flex items-center justify-end gap-1 text-[10px] font-mono font-bold text-foreground">
                                        {user.phoneNumber ? (
                                            <><Phone size={10} className="text-primary" /> {user.phoneNumber}</>
                                        ) : (
                                            <span className="text-muted-foreground/50">-</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center text-small text-muted-foreground uppercase tracking-[0.2em] font-black italic bg-muted/10 rounded-lg border border-border border-dashed">
                        {dict.roster.no_results}
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="card-container hidden md:block">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead className="data-table-thead">
                            <tr>
                                <th className="data-table-th">{dict.roster.table.avatar}</th>
                                <th
                                    className="data-table-th cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center gap-2">
                                        {dict.roster.table.name} {sortField === 'name' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th
                                    className="data-table-th cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleSort('badge')}
                                >
                                    <div className="flex items-center gap-2">
                                        {dict.roster.table.badge} {sortField === 'badge' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th
                                    className="data-table-th cursor-pointer hover:text-primary transition-colors"
                                    onClick={() => handleSort('rank')}
                                >
                                    <div className="flex items-center gap-2">
                                        {dict.roster.table.rank} {sortField === 'rank' && (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                    </div>
                                </th>
                                <th className="data-table-th">{dict.roster.table.contact}</th>
                                <th className="data-table-th text-right">{dict.roster.table.status}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr
                                        key={user.id}
                                        className="data-table-tr cursor-pointer"
                                        onClick={() => openProfile(user.id)}
                                    >
                                        <td className="data-table-td">
                                            {user.avatarUrl ? (
                                                <img src={user.avatarUrl} className="w-10 h-10 object-cover rounded border border-border" alt="" />
                                            ) : (
                                                <div
                                                    className="w-10 h-10 flex items-center justify-center rounded border border-border text-xs font-black text-foreground"
                                                    style={{ backgroundColor: getAvatarColor(user.rpName) + "20" }}
                                                >
                                                    {getInitials(user.rpName)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="data-table-td">
                                            <span className="text-body font-bold uppercase leading-tight text-foreground group-hover:text-primary transition-colors">{user.rpName}</span>
                                        </td>
                                        <td className="data-table-td">
                                            <div className="flex items-center gap-2 text-mono-data text-primary font-bold">
                                                <BadgeCheck size={14} /> {user.badgeNumber}
                                            </div>
                                        </td>
                                        <td className="data-table-td">
                                            <div className="flex items-center gap-2 text-[11px] font-black uppercase text-muted-foreground">
                                                <Shield size={14} className="text-primary/60" /> {user.rank.name}
                                            </div>
                                        </td>
                                        <td className="data-table-td">
                                            <div className="flex items-center gap-2 text-mono-data text-muted-foreground font-medium">
                                                <Phone size={14} /> {user.phoneNumber || "-"}
                                            </div>
                                        </td>
                                        <td className="data-table-td text-right">
                                            <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest" style={{ color: getStatusColor(user.status) }}>
                                                <span
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ backgroundColor: getStatusColor(user.status), boxShadow: `0 0 10px ${getStatusColor(user.status)}44` }}
                                                />
                                                {user.status === 'Active' ? dict.roster.status_types.active.split(' / ')[0] :
                                                    user.status === 'Standby' ? dict.roster.status_types.standby :
                                                        user.status === 'Leave' ? dict.roster.status_types.leave :
                                                            user.status === 'Suspended' ? dict.roster.status_types.suspended : user.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-small text-muted-foreground uppercase tracking-[0.2em] font-black italic">
                                        {dict.roster.no_results}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest text-right">
                {dict.roster.entries_info.replace('{count}', filteredUsers.length.toString()).replace('{total}', users.length.toString())}
            </div>
        </div>
    )
}
