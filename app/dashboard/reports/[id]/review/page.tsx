"use client"

import { Suspense, use, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Report } from "@/lib/store/reports"
import { getReportById } from "@/app/actions/reports"
import ReportView from "@/components/reports/ReportView"

export default function ReviewReportPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <Suspense fallback={
            <div className="p-8 flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Accessing Secure Node...</p>
                </div>
            </div>
        }>
            <ReviewContent params={params} />
        </Suspense>
    )
}

function ReviewContent({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const { data: session } = useSession()
    const [report, setReport] = useState<Report | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadReport = async () => {
            if (!id) return
            try {
                const data = await getReportById(id)
                if (data) {
                    // Map Prisma data to Report interface
                    const mappedReport: Report = {
                        ...data,
                        // Ensure authorName is present (Prisma include)
                        authorName: (data as any).author?.rpName || "Unknown",
                        // Map mapData to map
                        map: (data as any).mapData || { markers: [], shapes: [] },
                        // Map evidence
                        evidence: (data as any).evidence || { photo: [], video: [] },
                        // Deprecated but required by type
                        videos: [],
                        coAuthorIds: (data as any).coAuthors?.map((c: any) => c.id) || []
                    } as unknown as Report
                    setReport(mappedReport)
                }
            } catch (error) {
                console.error("Failed to load report for review", error)
            } finally {
                setLoading(false)
            }
        }
        loadReport()
    }, [id])

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Decryption in Progress...</p>
            </div>
        </div>
    )

    if (!report) return (
        <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="text-destructive font-black text-xl mb-2 uppercase tracking-tighter">Report Not Found</div>
            <p className="text-muted-foreground text-xs uppercase tracking-widest">The requested intelligence dossier does not exist or has been redacted.</p>
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
