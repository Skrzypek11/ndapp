"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerUser } from "@/lib/auth"

export async function getCases() {
    const user = await getServerUser()
    if (!user) return []

    try {
        const cases = await prisma.caseModel.findMany({
            include: {
                reportingOfficer: {
                    select: { id: true, rpName: true }
                },
                leadInvestigator: {
                    select: { id: true, rpName: true }
                },
                participants: {
                    select: { id: true, rpName: true }
                },
                linkedReports: {
                    select: { id: true, title: true, reportNumber: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return cases
    } catch (error) {
        console.error("Fetch Cases Error:", error)
        return []
    }
}

export async function getCaseById(id: string) {
    const user = await getServerUser()
    if (!user) return null

    try {
        const c = await prisma.caseModel.findUnique({
            where: { id },
            include: {
                reportingOfficer: true,
                leadInvestigator: true,
                participants: true,
                linkedReports: true
            }
        })

        if (!c) return null

        // Security Check
        const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
        const isParticipant = c.participants.some(p => p.id === user.id)
        const isLead = c.leadInvestigatorId === user.id
        const isReporting = c.reportingOfficerId === user.id

        if (!isAdmin && !isParticipant && !isLead && !isReporting) {
            return null
        }

        return c
    } catch (error) {
        console.error("Fetch Case Error:", error)
        return null
    }
}

export async function createCase(data: {
    title: string;
    description?: string;
    leadInvestigatorId: string;
    participantIds?: string[];
}) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const c = await prisma.caseModel.create({
            data: {
                title: data.title,
                description: data.description,
                reportingOfficerId: user.id,
                leadInvestigatorId: data.leadInvestigatorId,
                status: 'DRAFT',
                participants: {
                    connect: data.participantIds?.map(id => ({ id })) || []
                }
            }
        })
        revalidatePath("/dashboard/cases")
        return { success: true, case: c }
    } catch (error) {
        console.error("Create Case Error:", error)
        return { success: false, error: "Failed to create case" }
    }
}

export async function submitCase(id: string) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const c = await prisma.caseModel.findUnique({ where: { id } })
        if (!c) return { success: false, error: "Case not found" }

        const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
        if (!isAdmin && c.reportingOfficerId !== user.id) {
            return { success: false, error: "Only the reporting officer can submit this dossier" }
        }

        let caseId = c.caseId
        if (!caseId) {
            const now = new Date()
            const year = now.getFullYear()
            const count = await prisma.caseModel.count({
                where: { NOT: { caseId: null } }
            })
            caseId = `CASE-${year}-${(count + 1).toString().padStart(3, "0")}`
        }

        await prisma.caseModel.update({
            where: { id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
                caseId
            }
        })
        revalidatePath("/dashboard/cases")
        return { success: true }
    } catch (error) {
        console.error("Submit Case Error:", error)
        return { success: false, error: "Failed to submit case" }
    }
}

export async function updateCaseStatus(id: string, status: string, options?: { rejectionReason?: string }) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const c = await prisma.caseModel.findUnique({ where: { id } })
        if (!c) return { success: false, error: "Case not found" }

        const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
        const isLead = c.leadInvestigatorId === user.id

        if (!isAdmin && !isLead) {
            return { success: false, error: "Administrative or Lead Investigator privileges required" }
        }

        const data: any = { status }
        if (status === 'CLOSED') data.closedAt = new Date()
        if (options?.rejectionReason) data.rejectionReason = options.rejectionReason

        await prisma.caseModel.update({
            where: { id },
            data
        })
        revalidatePath("/dashboard/cases")
        revalidatePath(`/dashboard/cases/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Update Case Status Error:", error)
        return { success: false, error: "Failed to update case status" }
    }
}

export async function updateCase(id: string, data: {
    title?: string;
    description?: string;
    leadInvestigatorId?: string;
    participantIds?: string[];
    linkedReports?: { reportId: string, contextNote?: string }[];
}) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        const c = await prisma.caseModel.findUnique({ where: { id } })
        if (!c) return { success: false, error: "Case not found" }

        const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
        const isLead = c.leadInvestigatorId === user.id
        const isReporting = c.reportingOfficerId === user.id && c.status === 'DRAFT'

        if (!isAdmin && !isLead && !isReporting) {
            return { success: false, error: "Unauthorized modification attempt" }
        }

        await prisma.caseModel.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                leadInvestigatorId: data.leadInvestigatorId,
                participants: data.participantIds ? {
                    set: data.participantIds.map(id => ({ id }))
                } : undefined,
            }
        })
        revalidatePath("/dashboard/cases")
        revalidatePath(`/dashboard/cases/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Update Case Error:", error)
        return { success: false, error: "Failed to update case" }
    }
}
