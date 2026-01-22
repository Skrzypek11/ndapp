import { X } from "lucide-react"

interface ChipProps {
    label: string
    onRemove?: () => void
    icon?: React.ReactNode
}

export function Chip({ label, onRemove, icon }: ChipProps) {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-small font-tactical text-primary group hover:border-primary/40 transition-colors">
            {icon}
            <span className="leading-none">{label}</span>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
                >
                    <X size={12} />
                </button>
            )}
        </div>
    )
}
