"use client"

import { Input } from "@/components/ui/Input"
import { MarkerColor } from "@/lib/store/reports"
import { AlertCircle } from "lucide-react"

interface TacticalLegendProps {
    usedColors: MarkerColor[]
    legend: Record<MarkerColor, string>
    onChange?: (color: MarkerColor, description: string) => void
    readOnly?: boolean
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

import { useTranslation } from "@/lib/i18n"

export default function TacticalLegend({ usedColors, legend, onChange, readOnly = false }: TacticalLegendProps) {
    const { dict } = useTranslation()
    if (usedColors.length === 0) return null

    // Filter used colors for display: 
    // - In readOnly mode, only show if description exists.
    // - In edit mode, show all used colors.
    const colorsToDisplay = readOnly
        ? usedColors.filter(color => legend[color]?.trim())
        : usedColors

    if (colorsToDisplay.length === 0 && readOnly) return null

    return (
        <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase text-primary/60 tracking-widest border-b border-border pb-1">{dict.reports.tactical_map?.legend || "Tactical Map Legend"}</h3>

            <div className="grid gap-2">
                {colorsToDisplay.map(color => {
                    const description = legend[color] || ""
                    const isMissing = !description && !readOnly

                    return (
                        <div key={color} className="flex items-center gap-3 bg-black/20 p-2 rounded border border-white/5">
                            <div
                                className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                                style={{ background: PALETTE[color] }}
                            />

                            {readOnly ? (
                                <span className="text-xs font-mono text-foreground/80">{description}</span>
                            ) : (
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={description}
                                        onChange={(e) => onChange && onChange(color, e.target.value)}
                                        placeholder={(dict.reports.tactical_map?.placeholder || "Define {color} marker meaning...").replace("{color}", color)}
                                        className="w-full bg-transparent text-xs font-mono border-none focus:outline-none placeholder:text-muted-foreground/30 text-foreground"
                                    />
                                    {isMissing && (
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-orange-500/80 font-bold uppercase tracking-wider pointer-events-none">
                                            <AlertCircle size={10} />
                                            {dict.reports.tactical_map?.incomplete || "(Incomplete - Will not export)"}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
