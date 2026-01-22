"use client"

import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Marker, MarkerColor } from "@/lib/store/reports"
import { Trash2, Check } from "lucide-react"

interface MarkerEditModalProps {
    isOpen: boolean
    onClose: () => void
    marker: Marker | null
    onUpdate: (updates: Partial<Marker>) => void
    onDelete: (id: string) => void
}

const PALETTE: Record<MarkerColor, string> = {
    red: '#ef4444',
    blue: '#3b82f6',
    yellow: '#eab308',
    green: '#22c55e',
    orange: '#f97316',
    purple: '#a855f7',
    black: '#1f2937',
    white: '#f3f4f6'
}

export default function MarkerEditModal({ isOpen, onClose, marker, onUpdate, onDelete }: MarkerEditModalProps) {
    if (!marker) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit Intel Marker: ${marker.id}`}
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest mb-1.5 block">Tactical Label (Optional)</label>
                        <input
                            type="text"
                            value={marker.title || ''}
                            onChange={(e) => onUpdate({ title: e.target.value })}
                            placeholder="e.g., SUSPECT VEHICLE, SNIPER NEST"
                            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors uppercase font-mono"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest mb-1.5 block">Intelligence Description</label>
                        <textarea
                            value={marker.desc || ''}
                            onChange={(e) => onUpdate({ desc: e.target.value })}
                            placeholder="Enter detailed tactical intelligence..."
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors font-sans resize-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest mb-3 block">Tactical Classification</label>
                    <div className="grid grid-cols-4 gap-3">
                        {(Object.keys(PALETTE) as MarkerColor[]).map((color) => {
                            const isActive = marker.color === color
                            return (
                                <button
                                    key={color}
                                    onClick={() => onUpdate({ color })}
                                    className={`
                                        group relative aspect-square rounded-lg border-2 transition-all duration-200
                                        ${isActive ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-white/5 hover:border-white/20'}
                                    `}
                                    style={{ backgroundColor: PALETTE[color] }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black/60 backdrop-blur-sm p-1 rounded-md">
                                            <div className="text-[8px] font-bold text-white uppercase tracking-tighter">{color}</div>
                                        </div>
                                    </div>
                                    {isActive && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground rounded-full p-0.5 shadow-lg">
                                            <Check size={10} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                            onDelete(marker.id)
                            onClose()
                        }}
                        icon={Trash2}
                    >
                        Delete Marker
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onClose}
                    >
                        Confirm Intel
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
