"use client"

import { use, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { ReportStore, Report } from "@/lib/store/reports"
import ReportView from "@/components/reports/ReportView"

export default function ReviewReportPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: session } = useSession()
    const [report, setReport] = useState<Report | null>(null)

    useEffect(() => {
        if (id) {
            const data = ReportStore.getById(id)
            if (data) setReport(data)
        }
    }, [id])

    if (!report) return (
        <div className="p-8 flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Accessing Internal Database...</p>
            </div>
        </div>
    )

    // Permission check
    const isAdmin = session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"
    if (!isAdmin) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="text-red-500 font-black text-xl mb-2 uppercase tracking-tighter">Access Denied</div>
                <p className="text-white/40 text-xs uppercase tracking-widest">Unauthorized Badge level for this secure node.</p>
            </div>
        )
    }

    return <ReportView report={report} isReview={true} />
}
