"use client"

import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Shape } from "@/lib/store/reports"
import { Trash2, Check } from "lucide-react"

interface ShapeEditModalProps {
    isOpen: boolean
    onClose: () => void
    shape: Shape | null
    onUpdate: (updates: Partial<Shape>) => void
    onDelete: (id: string) => void
}

const COLORS = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Black', value: '#1f2937' },
    { name: 'White', value: '#f3f4f6' }
]

export default function ShapeEditModal({ isOpen, onClose, shape, onUpdate, onDelete }: ShapeEditModalProps) {
    if (!shape) return null

    const typeLabel = shape.type.toUpperCase()

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Edit Area Intel: ${shape.id} (${typeLabel})`}
        >
            <div className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest mb-1.5 block">Tactical Label (Optional)</label>
                        <input
                            type="text"
                            value={shape.title || ''}
                            onChange={(e) => onUpdate({ title: e.target.value })}
                            placeholder="e.g., PERIMETER ALPHA, EVAC ROUTE"
                            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors uppercase font-mono"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest mb-1.5 block">Intelligence Description</label>
                        <textarea
                            value={shape.desc || ''}
                            onChange={(e) => onUpdate({ desc: e.target.value })}
                            placeholder="Enter details about this area/path..."
                            rows={3}
                            className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-colors font-sans resize-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase text-primary/60 tracking-widest mb-3 block">Tactical Coloration</label>
                    <div className="grid grid-cols-4 gap-3">
                        {COLORS.map((color) => {
                            const isActive = shape.color === color.value
                            return (
                                <button
                                    key={color.value}
                                    onClick={() => onUpdate({ color: color.value })}
                                    className={`
                                        group relative aspect-square rounded-lg border-2 transition-all duration-200
                                        ${isActive ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-white/5 hover:border-white/20'}
                                    `}
                                    style={{ backgroundColor: color.value }}
                                >
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-black/60 backdrop-blur-sm p-1 rounded-md">
                                            <div className="text-[8px] font-bold text-white uppercase tracking-tighter">{color.name}</div>
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
                            onDelete(shape.id)
                            onClose()
                        }}
                        icon={Trash2}
                    >
                        Delete Area
                    </Button>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onClose}
                    >
                        Save Intelligence
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
