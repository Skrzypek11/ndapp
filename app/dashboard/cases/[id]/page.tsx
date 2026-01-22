"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import { getCaseById } from "@/app/actions/cases"
import CaseView from "@/components/cases/CaseView"

export default function CaseDetailsPage() {
    const { data: session } = useSession()
    const { id } = useParams()
    const [caseData, setCaseData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (id) {
                const data = await getCaseById(id as string)
                setCaseData(data)
            }
            setLoading(false)
        }
        loadData()
    }, [id])

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Accessing Dossier...</p>
            </div>
        </div>
    )

    if (!caseData) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-black uppercase text-primary mb-2 italic">Dossier Not Found</h2>
                <p className="text-white/40 text-[10px] uppercase tracking-widest">The requested case record does not exist or has been expunged.</p>
            </div>
        )
    }

    const isAdmin = session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"

    return <CaseView caseData={caseData} isAdmin={isAdmin} />
}
