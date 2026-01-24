"use client"

import { useState, useEffect } from "react"
import { Users, Search, Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Modal } from "@/components/ui/Modal"
import { Input } from "@/components/ui/Input"
import { Chip } from "@/components/ui/Chip"
import { getUsers } from "@/app/actions/user"

interface Agent {
    id: string
    name: string
    badge: string
}

interface CoAuthorSelectProps {
    selectedIds: string[]
    onChange: (ids: string[]) => void
}

export default function CoAuthorSelect({ selectedIds, onChange }: CoAuthorSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchAgents = async () => {
            setLoading(true)
            try {
                const users = await getUsers()
                const formattedAgents = users.map((u: any) => ({
                    id: u.id,
                    name: u.rpName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
                    badge: u.badgeNumber || "N/A"
                }))
                setAgents(formattedAgents)
            } catch (error) {
                console.error("Failed to fetch agents", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAgents()
    }, [])

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((sid) => sid !== id))
        } else {
            onChange([...selectedIds, id])
        }
    }

    const selectedAgents = agents.filter(a => selectedIds.includes(a.id))
    const filteredAgents = agents.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.badge.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-3">
            {/* Selected Chips Area */}
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded border border-border bg-background/30 items-center">
                {selectedAgents.length === 0 && (
                    <span className="text-xs text-muted-foreground italic px-2">No co-authors selected</span>
                )}
                {selectedAgents.map(agent => (
                    <Chip
                        key={agent.id}
                        label={`${agent.badge} - ${agent.name.split(' ').pop()}`}
                        onRemove={() => toggleSelection(agent.id)}
                        icon={<Users size={10} />}
                    />
                ))}
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                icon={Plus}
                className="w-full"
            >
                Add / Remove Co-Authors
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Select Participating Officers"
                footer={
                    <Button onClick={() => setIsOpen(false)}>Done</Button>
                }
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-muted-foreground h-4 w-4" />
                        <Input
                            placeholder="Search by name or badge..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="text-center py-8 text-muted-foreground text-xs uppercase tracking-widest animate-pulse">
                                Loading Personnel Database...
                            </div>
                        ) : (
                            <>
                                {filteredAgents.map(agent => {
                                    const isSelected = selectedIds.includes(agent.id)
                                    return (
                                        <div
                                            key={agent.id}
                                            onClick={() => toggleSelection(agent.id)}
                                            className={`flex items-center justify-between p-3 rounded cursor-pointer transition-colors border ${isSelected ? 'bg-primary/20 border-primary text-primary-foreground' : 'border-transparent hover:bg-white/5'}`}
                                        >
                                            <div>
                                                <div className="font-bold text-sm tracking-wide">{agent.name}</div>
                                                <div className="text-[10px] opacity-70 font-mono tracking-widest">{agent.badge}</div>
                                            </div>
                                            {isSelected && <Check size={16} className="text-primary" />}
                                        </div>
                                    )
                                })}
                                {filteredAgents.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-xs uppercase tracking-widest">
                                        No officers found
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </Modal>
        </div>
    )
}

