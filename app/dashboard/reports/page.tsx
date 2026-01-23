"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Plus, FileText, Search, Eye, Download, ChevronLeft, ChevronRight, FileDown } from "lucide-react"
import { useTranslation } from "@/lib/i18n"
import { getReports } from "@/app/actions/reports"
import { Report } from "@/lib/store/reports"

export default function ReportsListPage() {
    const { data: session } = useSession()
    const { dict } = useTranslation()
    const [reports, setReports] = useState<Report[]>([])
    const [loading, setLoading] = useState(true)
    const [exportingId, setExportingId] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            const data = await getReports()
            const mappedData: Report[] = data.map((r: any) => ({
                ...r,
                reportNumber: r.reportNumber || "Pending Number",
                map: r.mapData || { markers: [], shapes: [] },
                // videos is deprecated in type but might be required
                videos: [],
                coAuthorIds: r.coAuthors ? r.coAuthors.map((c: any) => c.id) : []
            }))
            setReports(mappedData)
            setLoading(false)
        }
        loadData()
    }, [])

    const handleExport = async (report: Report) => {
        if (report.status !== 'APPROVED') return
        setExportingId(report.id)
        try {
            const { PDFExportService } = await import('@/lib/services/PDFExportService')
            const service = new PDFExportService(report)
            await service.generate()
        } catch (e) {
            console.error(e)
            alert("Export failed. Please check technical console.")
        } finally {
            setExportingId(null)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-small font-semibold uppercase tracking-widest text-primary/60">{dict.reports.list.retrieving}</p>
            </div>
        </div>
    )

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'APPROVED': return "bg-primary/20 text-primary border-primary/30"
            case 'PENDING': return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
            case 'DRAFT': return "bg-muted text-muted-foreground border-border"
            case 'REJECTED': return "bg-destructive/20 text-destructive border-destructive/30"
            case 'UNDER_INVESTIGATION': return "bg-blue-500/20 text-blue-500 border-blue-500/30"
            default: return "bg-muted text-muted-foreground border-border"
        }
    }

    return (
        <div className="animate-fade-in space-y-6 pb-12">
            <header className="page-header">
                <div className="page-title-group">
                    <h1 className="page-title">{dict.reports.list.title}</h1>
                    <p className="page-subtitle">Narcotics & Intelligence Database</p>
                </div>
                <Link
                    href="/dashboard/reports/create"
                    className="btn-primary"
                >
                    <Plus size={16} />
                    {dict.reports.list.create}
                </Link>
            </header>

            <div className="card-container">
                {reports.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="p-6 bg-muted/30 rounded-full">
                            <FileText size={48} className="text-muted-foreground/30" strokeWidth={1} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-body font-bold text-foreground">{dict.reports.list.no_reports}</p>
                            <p className="text-small text-muted-foreground uppercase tracking-wider">No dossiers filed in current sector</p>
                        </div>
                        <Link
                            href="/dashboard/reports/create"
                            className="text-primary hover:text-primary/80 text-small font-black uppercase tracking-widest underline underline-offset-4"
                        >
                            {dict.reports.list.create_first}
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {reports.slice(0, 10).map((report) => {
                                const isApproved = report.status === 'APPROVED'
                                const statusKey = report.status.toLowerCase().replace(/_/g, '')
                                return (
                                    <div key={report.id} className="bg-card border border-border rounded-lg p-5 shadow-sm active:scale-[0.98] transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-mono-data text-primary/70 font-bold text-[10px]">{report.reportNumber}</span>
                                            <span className={`status-badge ${report.status === 'APPROVED' ? 'status-badge-approved' :
                                                report.status === 'SUBMITTED' ? 'status-badge-pending' :
                                                    report.status === 'REVISIONS_REQUIRED' ? 'status-badge-rejected' : 'status-badge-draft'
                                                }`}>
                                                {dict.reports.status[statusKey as keyof typeof dict.reports.status] || report.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-small font-bold uppercase tracking-wide text-foreground leading-tight mb-1">{report.title}</h3>
                                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">BY {report.authorName}</div>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-border/50 pt-3 gap-3">
                                            <Link
                                                href={`/dashboard/reports/${report.id}`}
                                                className="btn-secondary !px-3 !py-1.5 !text-[10px] flex-1 justify-center"
                                            >
                                                <Eye size={12} />
                                                {dict.reports.list.view}
                                            </Link>
                                            <button
                                                disabled={!isApproved || exportingId === report.id}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleExport(report);
                                                }}
                                                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 border rounded text-[10px] font-black uppercase tracking-widest transition-all flex-1 ${isApproved
                                                    ? "bg-muted border-border text-foreground hover:bg-border cursor-pointer shadow-sm active:scale-95"
                                                    : "bg-muted/50 border-border/50 text-muted-foreground/30 cursor-not-allowed"
                                                    }`}
                                            >
                                                {exportingId === report.id ? (
                                                    <span className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                ) : (
                                                    <FileDown size={12} />
                                                )}
                                                {exportingId === report.id ? "..." : "PDF"}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Desktop Table View */}
                        <table className="data-table hidden md:table">
                            <thead className="data-table-thead">
                                <tr>
                                    <th className="data-table-th">{dict.reports.table.report_number}</th>
                                    <th className="data-table-th">{dict.reports.table.title}</th>
                                    <th className="data-table-th hidden md:table-cell">{dict.reports.table.author}</th>
                                    <th className="data-table-th hidden lg:table-cell">{dict.reports.table.date}</th>
                                    <th className="data-table-th">{dict.reports.table.status}</th>
                                    <th className="data-table-th text-right">{dict.reports.table.actions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {reports.slice(0, 10).map((report) => {
                                    const isApproved = report.status === 'APPROVED'
                                    const statusKey = report.status.toLowerCase().replace(/_/g, '')

                                    return (
                                        <tr key={report.id} className="data-table-tr group">
                                            <td className="data-table-td">
                                                <span className="text-mono-data text-primary/70 font-bold">{report.reportNumber}</span>
                                            </td>
                                            <td className="data-table-td">
                                                <div className="space-y-0.5">
                                                    <div className="text-small font-bold uppercase tracking-wide text-foreground group-hover:text-primary transition-colors">{report.title}</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-widest md:hidden font-medium">BY {report.authorName}</div>
                                                </div>
                                            </td>
                                            <td className="data-table-td hidden md:table-cell">
                                                <span className="text-small font-semibold uppercase text-muted-foreground">{report.authorName}</span>
                                            </td>
                                            <td className="data-table-td hidden lg:table-cell">
                                                <span className="text-small text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</span>
                                            </td>
                                            <td className="data-table-td">
                                                <span className={`status-badge ${report.status === 'APPROVED' ? 'status-badge-approved' :
                                                    report.status === 'SUBMITTED' ? 'status-badge-pending' :
                                                        report.status === 'REVISIONS_REQUIRED' ? 'status-badge-rejected' : 'status-badge-draft'
                                                    }`}>
                                                    {dict.reports.status[statusKey as keyof typeof dict.reports.status] || report.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="data-table-td">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/dashboard/reports/${report.id}`}
                                                        className="btn-secondary !px-3 !py-1.5 !text-[10px]"
                                                    >
                                                        <Eye size={12} />
                                                        {dict.reports.list.view}
                                                    </Link>

                                                    <div className="relative group/tooltip">
                                                        <button
                                                            disabled={!isApproved || exportingId === report.id}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                handleExport(report);
                                                            }}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-[10px] font-black uppercase tracking-widest transition-all ${isApproved
                                                                ? "bg-muted border-border text-foreground hover:bg-border cursor-pointer shadow-sm active:scale-95"
                                                                : "bg-muted/50 border-border/50 text-muted-foreground/30 cursor-not-allowed"
                                                                }`}
                                                        >
                                                            {exportingId === report.id ? (
                                                                <span className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                                            ) : (
                                                                <FileDown size={12} />
                                                            )}
                                                            {exportingId === report.id ? "..." : dict.reports.list.export_pdf}
                                                        </button>

                                                        {/* Tooltip */}
                                                        <div className="absolute bottom-full right-0 mb-2 invisible group-hover/tooltip:visible opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 z-50">
                                                            <div className="bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-xl whitespace-nowrap border border-border">
                                                                {isApproved ? dict.reports.list.export_tooltip : dict.reports.list.export_disabled_tooltip}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-muted/10 border-t border-border gap-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {dict.reports.list.pagination.showing} 1 - {Math.min(10, reports.length)} {dict.reports.list.pagination.of} {reports.length} {dict.reports.list.pagination.records}
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="btn-icon disabled:opacity-30" disabled>
                                    <ChevronLeft size={16} />
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded text-[10px] font-black bg-primary text-primary-foreground">1</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded text-[10px] font-black text-muted-foreground hover:bg-muted transition-colors">2</button>
                                <button className="w-8 h-8 flex items-center justify-center rounded text-[10px] font-black text-muted-foreground hover:bg-muted transition-colors">3</button>
                                <button className="btn-icon">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
