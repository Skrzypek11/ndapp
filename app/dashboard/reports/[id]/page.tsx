"use client"

import { use } from "react"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { getReportById } from "@/app/actions/reports"
import ReportView from "@/components/reports/ReportView"

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: session } = useSession()
    const [report, setReport] = useState<any | null>(null)

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                const data = await getReportById(id)
                if (data) {
                    // Map mapData to map for compatibility with existing components if needed
                    // or update components to handle mapData.
                    const formatted = {
                        ...data,
                        authorName: (data.author as any)?.rpName || 'Unknown',
                        map: data.mapData || { markers: [], shapes: [] }
                    }
                    setReport(formatted)
                }
            }
        }
        loadData()
    }, [id])

    if (!report) return (
        <div className="p-8 flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Initializing Satellite Data...</p>
            </div>
        </div>
    )

    return <ReportView report={report} isReview={false} />
}
