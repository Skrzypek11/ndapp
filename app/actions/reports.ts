"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerUser } from "@/lib/auth"

export async function getReports() {
    const user = await getServerUser()
    if (!user) return []

    try {
        const reports = await prisma.report.findMany({
            where: {
                OR: [
                    { status: { not: 'DRAFT' } },
                    { authorId: user.id },
                    { coAuthors: { some: { id: user.id } } }
                ]
            },
            include: {
                author: {
                    select: { id: true, rpName: true }
                },
                coAuthors: {
                    select: { id: true, rpName: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return reports.map(r => ({
            ...r,
            authorName: r.author.rpName,
            coAuthorNames: r.coAuthors.map(ca => ca.rpName)
        }))
    } catch (error) {
        console.error("Fetch Reports Error:", error)
        return []
    }
}

export async function getReportById(id: string) {
    const user = await getServerUser()
    if (!user) return null

    try {
        const report = await prisma.report.findUnique({
            where: { id },
            include: {
                author: true,
                coAuthors: true,
                reviewer: true,
                cases: true,
                confiscations: { include: { officer: true } }
            }
        })

        if (!report) return null

        // Security Check: Only author, co-author or admin can see drafts
        const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
        if (report.status === 'DRAFT' && !isAdmin) {
            const isAuthor = report.authorId === user.id
            const isCoAuthor = report.coAuthors.some(ca => ca.id === user.id)
            if (!isAuthor && !isCoAuthor) return null
        }

        return report
    } catch (error) {
        console.error("Fetch Report Error:", error)
        return null
    }
}

export async function createReport(data: {
    title: string;
    content?: string;
    mapData?: any;
    legend?: any;
    evidence?: any;
    confiscationIds?: string[];
}) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const report = await prisma.report.create({
            data: {
                title: data.title,
                authorId: user.id,
                content: data.content,
                mapData: data.mapData || { markers: [], shapes: [] },
                legend: data.legend || {},
                evidence: data.evidence || { photo: [], video: [] },
                status: 'DRAFT',
            }
        })

        if (data.confiscationIds && data.confiscationIds.length > 0) {
            await prisma.confiscation.updateMany({
                where: { id: { in: data.confiscationIds } },
                data: { reportId: report.id }
            })
        }

        revalidatePath("/dashboard/reports")
        return { success: true, report }
    } catch (error) {
        console.error("Create Report Error:", error)
        return { success: false, error: "Failed to create report" }
    }
}

export async function updateReport(id: string, updates: any) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const report = await prisma.report.findUnique({
            where: { id },
            include: { coAuthors: true }
        })

        if (!report) return { success: false, error: "Report not found" }

        const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
        const isAuthor = report.authorId === user.id
        const isCoAuthor = report.coAuthors.some(ca => ca.id === user.id)

        if (!isAdmin && !isAuthor && !isCoAuthor) {
            return { success: false, error: "Unauthorized modification attempt" }
        }

        const { confiscationIds, ...reportData } = updates

        await prisma.report.update({
            where: { id },
            data: reportData
        })

        if (confiscationIds && Array.isArray(confiscationIds)) {
            // First unlink all (optional, but ensures sync) or just add new ones? 
            // Better to just link provided ones for now to avoid accidental unlinks unless we send full state
            // Let's assume we send new additions, or we handle unlinking separately. 
            // But for full sync behavior:
            // 1. Unlink all from this report (reset to null)
            // 2. Link new list
            // However, that might be too aggressive if we don't load all first.
            // Let's stick to "Link provided IDs"
            if (confiscationIds.length > 0) {
                await prisma.confiscation.updateMany({
                    where: { id: { in: confiscationIds } },
                    data: { reportId: id }
                })
            }
        }

        revalidatePath(`/dashboard/reports/${id}`)
        revalidatePath("/dashboard/reports")
        return { success: true }
    } catch (error) {
        console.error("Update Report Error:", error)
        return { success: false, error: "Failed to update report" }
    }
}

export async function submitReport(id: string) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const report = await prisma.report.findUnique({
            where: { id },
            include: { coAuthors: true }
        })

        if (!report) return { success: false, error: "Report not found" }

        const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
        const isAuthor = report.authorId === user.id
        const isCoAuthor = report.coAuthors.some(ca => ca.id === user.id)

        if (!isAdmin && !isAuthor && !isCoAuthor) {
            return { success: false, error: "Unauthorized submission attempt" }
        }

        let reportNumber = report.reportNumber
        if (!reportNumber) {
            const now = new Date()
            const year = now.getFullYear().toString().slice(-2)
            const month = (now.getMonth() + 1).toString().padStart(2, "0")
            const count = await prisma.report.count({
                where: { NOT: { reportNumber: null } }
            })
            const sequence = (count + 1).toString().padStart(3, "0")
            reportNumber = `ND-${year}-${month}-${sequence}`
        }

        await prisma.report.update({
            where: { id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                reportNumber
            }
        })
        revalidatePath("/dashboard/reports")
        return { success: true }
    } catch (error) {
        console.error("Submit Report Error:", error)
        return { success: false, error: "Failed to submit report" }
    }
}

export async function deleteReport(id: string) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
    if (!isAdmin) return { success: false, error: "Administrative privileges required" }

    try {
        await prisma.report.delete({ where: { id } })
        revalidatePath("/dashboard/reports")
        return { success: true }
    } catch (error) {
        console.error("Delete Report Error:", error)
        return { success: false, error: "Failed to delete report" }
    }
}

export async function reviewReport(id: string, action: 'approve' | 'reject', rejectionReason?: string) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
    if (!isAdmin) return { success: false, error: "Administrative privileges required" }

    try {
        const status = action === 'approve' ? 'APPROVED' : 'REVISIONS_REQUIRED'

        await prisma.report.update({
            where: { id },
            data: {
                status,
                reviewerId: user.id,
                // rejectionReason is not in schema yet, skipping persistence for now
            }
        })
        revalidatePath("/dashboard/reports")
        revalidatePath(`/dashboard/reports/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Review Report Error:", error)
        return { success: false, error: "Failed to process review" }
    }
}
