import { Scale, ShieldAlert } from "lucide-react"

interface SeizureStatsProps {
    totalKg: number
    userKg: number
    dict: any
}

export default function SeizureStats({ totalKg, userKg, dict }: SeizureStatsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Total Unit Seizures */}
            <div className="bg-card border border-primary/20 p-6 rounded-md shadow-[0_0_30px_-5px_hsl(var(--primary)/0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-12">
                    <ShieldAlert size={100} />
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_hsl(var(--primary)/0.4)] animate-pulse">
                            <ShieldAlert size={20} />
                        </div>
                        <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">
                            {dict.dashboard.stats.unit_seizures}
                        </h3>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter text-foreground drop-shadow-lg">
                            {totalKg.toFixed(2)}
                        </span>
                        <span className="text-xl font-bold text-muted-foreground uppercase tracking-widest">KG</span>
                    </div>

                    <div className="mt-4 w-full bg-primary/10 h-1 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-[60%]"></div>
                    </div>
                </div>
            </div>

            {/* Personal Seizures */}
            <div className="bg-card border border-border p-6 rounded-md shadow-lg relative overflow-hidden group hover:border-primary/30 transition-all">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all duration-700 transform group-hover:scale-110 group-hover:-rotate-12">
                    <Scale size={100} />
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <Scale size={20} />
                        </div>
                        <h3 className="text-small font-black uppercase tracking-[0.2em] text-foreground italic">
                            {dict.dashboard.stats.my_seizures}
                        </h3>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500">
                            {userKg.toFixed(2)}
                        </span>
                        <span className="text-xl font-bold text-muted-foreground uppercase tracking-widest">KG</span>
                    </div>

                    <div className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                        {dict.dashboard.stats.contribution}: {totalKg > 0 ? ((userKg / totalKg) * 100).toFixed(1) : 0}%
                    </div>
                </div>
            </div>
        </div>
    )
}
