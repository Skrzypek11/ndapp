"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslation } from "@/lib/i18n"
import { createConfiscation } from "@/app/actions/confiscations"
import { getDrugTypes } from "@/app/actions/registries"
import { searchDraftReports } from "@/app/actions/reports_search"
import { ChevronLeft, Save, Scale, AlertTriangle, FileText, X } from "lucide-react"

export default function CreateConfiscationPage() {
    const { dict } = useTranslation()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        citizenName: "",
        drugType: "Marihuana",
        quantity: "",
        unit: "g",
        notes: ""
    })

    const [drugTypes, setDrugTypes] = useState<any[]>([])

    // Check if we have a report search result
    const [reportSearch, setReportSearch] = useState("")
    const [foundReports, setFoundReports] = useState<any[]>([])
    const [selectedReport, setSelectedReport] = useState<any>(null)
    const [searchingReports, setSearchingReports] = useState(false)

    useEffect(() => {
        getDrugTypes().then(setDrugTypes)
    }, [])

    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (reportSearch.length >= 2) {
                setSearchingReports(true)
                const results = await searchDraftReports(reportSearch)
                setFoundReports(results)
                setSearchingReports(false)
            } else {
                setFoundReports([])
            }
        }, 500)
        return () => clearTimeout(timeout)
    }, [reportSearch])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
            alert("Valid quantity required")
            setLoading(false)
            return
        }

        let quantityInGrams = parseFloat(formData.quantity)
        if (formData.unit === "kg") quantityInGrams *= 1000
        if (formData.unit === "oz") quantityInGrams *= 28.3495
        if (formData.unit === "lbs") quantityInGrams *= 453.592

        const res = await createConfiscation({
            citizenName: formData.citizenName,
            drugType: formData.drugType,
            quantity: quantityInGrams,
            unit: 'g',
            notes: formData.notes,
            reportId: selectedReport?.id
        })

        if (res.success) {
            router.push("/dashboard/confiscations")
        } else {
            alert("Error creating confiscation log")
            setLoading(false)
        }
    }

    return (
        <div className="animate-fade-in max-w-3xl mx-auto pb-20">
            {/* Header */}
            <div className="mb-8 flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight text-foreground">
                        {dict.confiscations.create_header}
                    </h1>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mt-1">
                        {dict.confiscations.subtitle}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-md shadow-sm overflow-hidden">
                <div className="p-6 space-y-6">
                    {/* Citizen Info */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">
                            {dict.confiscations.form.citizen_label}
                        </label>
                        <input
                            type="text"
                            value={formData.citizenName}
                            onChange={e => setFormData({ ...formData, citizenName: e.target.value })}
                            placeholder={dict.confiscations.form.citizen_placeholder}
                            className="w-full bg-background border border-border rounded p-3 text-small focus:outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Drug Type */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">
                                {dict.confiscations.form.drug_label}
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.drugType}
                                    onChange={e => setFormData({ ...formData, drugType: e.target.value })}
                                    className="w-full bg-background border border-border rounded p-3 text-small appearance-none focus:outline-none focus:border-primary/50 transition-colors"
                                >
                                    {drugTypes.length > 0 ? (
                                        drugTypes.map(drug => (
                                            <option key={drug.id} value={drug.name}>
                                                {drug.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="Marihuana">Marihuana (Default)</option>
                                    )}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <Scale size={16} />
                                </div>
                            </div>
                            <div className="px-1">
                                <p className="text-[9px] text-muted-foreground italic">
                                    * Select substance from registry
                                </p>
                            </div>
                        </div>

                        {/* Quantity & Unit */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">
                                {dict.confiscations.form.qty_label}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    className="flex-1 bg-background border border-border rounded p-3 text-small focus:outline-none focus:border-primary/50 transition-colors font-mono"
                                    placeholder="0.00"
                                    required
                                />
                                <select
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                    className="w-24 bg-background border border-border rounded p-3 text-small focus:outline-none focus:border-primary/50 transition-colors font-mono font-bold"
                                >
                                    <option value="g">g</option>
                                    <option value="kg">kg</option>
                                    <option value="oz">oz</option>
                                    <option value="lbs">lbs</option>
                                </select>
                            </div>
                            <div className="px-1">
                                <p className="text-[9px] text-muted-foreground italic">
                                    * Auto-converted to grams
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1">
                            {dict.confiscations.form.notes_label}
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-background border border-border rounded p-3 text-small focus:outline-none focus:border-primary/50 transition-colors min-h-[100px]"
                            placeholder="..."
                        />
                    </div>

                    {/* Report Linking (Optional) */}
                    <div className="space-y-2 border-t border-border/50 pt-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/70 px-1 flex items-center gap-2">
                            <FileText size={12} />
                            Assign to Report (Draft)
                        </label>

                        {selectedReport ? (
                            <div className="bg-primary/10 border border-primary/20 p-3 rounded flex items-center justify-between">
                                <div>
                                    <div className="text-[11px] font-black uppercase tracking-widest text-primary">
                                        {selectedReport.reportNumber || "NO NUMBER"}
                                    </div>
                                    <div className="text-[10px] font-bold text-foreground/80">
                                        {selectedReport.title}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedReport(null)}
                                    className="p-1 hover:bg-destructive/10 hover:text-destructive rounded text-muted-foreground transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={reportSearch}
                                    onChange={e => setReportSearch(e.target.value)}
                                    placeholder="Search by Report # or Title..."
                                    className="w-full bg-background border border-border rounded p-3 text-small focus:outline-none focus:border-primary/50 transition-colors pl-9"
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                    <FileText size={16} />
                                </div>

                                {/* Results Dropdown */}
                                {foundReports.length > 0 && (
                                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {foundReports.map(report => (
                                            <button
                                                key={report.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedReport(report)
                                                    setReportSearch("")
                                                    setFoundReports([])
                                                }}
                                                className="w-full text-left p-3 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                                                        {report.reportNumber || "DRAFT"}
                                                    </span>
                                                    <span className="text-[9px] text-muted-foreground">
                                                        {new Date(report.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="text-small font-bold truncate">
                                                    {report.title}
                                                </div>
                                                <div className="text-[9px] text-muted-foreground italic">
                                                    By {report.author.rpName}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searchingReports && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                                        Searching...
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="px-1">
                            <p className="text-[9px] text-muted-foreground italic">
                                * Can only link to reports in DRAFT status
                            </p>
                        </div>
                    </div>

                </div>

                <div className="bg-muted/30 border-t border-border p-4 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 rounded text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        {dict.confiscations.form.cancel}
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {loading ? "PROCESSING..." : (
                            <>
                                <Save size={14} />
                                {dict.confiscations.form.submit}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
