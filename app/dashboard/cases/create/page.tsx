"use client"

import { Suspense, use, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Briefcase, ChevronLeft } from "lucide-react"
import { createCase, updateCase, getCaseById } from "@/app/actions/cases"
import CaseForm from "@/components/cases/CaseForm"
import { useTranslation } from "@/lib/i18n"

export default function CreateCasePage() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-muted-foreground">Loading interface...</div>}>
            <CreateCaseContent />
        </Suspense>
    )
}

function CreateCaseContent() {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [initialCase, setInitialCase] = useState<any>(undefined)

    const editId = searchParams.get("edit")

    useEffect(() => {
        const loadInitial = async () => {
            if (editId) {
                const data = await getCaseById(editId)
                if (data) setInitialCase(data)
            }
        }
        loadInitial()
    }, [editId])

    const handleSubmit = async (formData: any) => {
        if (!session?.user) return
        setLoading(true)
        try {
            let result;
            if (editId) {
                result = await updateCase(editId, {
                    ...formData,
                    participantIds: formData.participants,
                    leadInvestigatorId: formData.leadInvestigatorId || session.user.id
                })
            } else {
                result = await createCase({
                    ...formData,
                    reportingOfficerId: session.user.id,
                    participantIds: formData.participants,
                    leadInvestigatorId: formData.leadInvestigatorId || session.user.id
                })
            }

            if (result.success) {
                router.push("/dashboard/cases")
            } else {
                alert(result.error || "Failed to save case dossier")
            }
        } catch (e) {
            console.error(e)
            alert("An unexpected error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in space-y-8 pb-12">
            <header className="bg-card border border-border p-6 rounded-md shadow-xl backdrop-blur-md bg-opacity-95">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-1 hover:text-foreground transition-colors text-[10px] font-black uppercase tracking-widest"
                            >
                                <ChevronLeft size={14} /> {dict.cases.form.back}
                            </button>
                            <span className="text-border">|</span>
                            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/70">
                                {editId ? dict.cases.form.edit_subtitle : dict.cases.form.subtitle}
                            </span>
                        </div>

                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-primary/20 rounded flex items-center justify-center text-primary border border-primary/30 shadow-inner">
                                <Briefcase size={28} />
                            </div>
                            <div>
                                <h1 className="text-h1 text-foreground leading-none mb-1">
                                    {editId ? dict.cases.form.edit_header : dict.cases.form.header}
                                </h1>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono leading-none">
                                    {dict.cases.form.network}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-col text-right pr-6 border-r border-border gap-1">
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {dict.cases.view.metadata.case_id}: <span className="text-primary font-mono">{editId ? editId.slice(0, 8) : dict.reports.form.pending}</span>
                        </div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {dict.cases.view.metadata.reporting_officer}: <span className="text-foreground">{session?.user?.name}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto">
                <CaseForm
                    initialData={initialCase}
                    onSubmit={handleSubmit}
                    loading={loading}
                    isAdmin={session?.user?.rank?.systemRole === "ADMIN" || session?.user?.rank?.systemRole === "ROOT"}
                />
            </div>
        </div>
    )
}
