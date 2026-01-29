"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerUser } from "@/lib/auth"

export async function getConfiscations() {
    try {
        const data = await prisma.confiscation.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                officer: {
                    select: {
                        rpName: true,
                        badgeNumber: true
                    }
                },
                report: {
                    select: {
                        reportNumber: true,
                        title: true
                    }
                }
            }
        })
        return data
    } catch (error) {
        console.error("Fetch Confiscations Error:", error)
        return []
    }
}

export async function getUnlinkedConfiscations(search: string) {
    try {
        const data = await prisma.confiscation.findMany({
            where: {
                reportId: null,
                OR: [
                    { citizenName: { contains: search, mode: 'insensitive' } },
                    { drugType: { contains: search, mode: 'insensitive' } }
                ]
            },
            take: 10,
            include: {
                officer: { select: { rpName: true } }
            },
            orderBy: { createdAt: 'desc' }
        })
        return data
    } catch (error) {
        return []
    }
}

export async function createConfiscation(data: {
    citizenName?: string | null,
    drugType: string,
    quantity: number,
    unit?: string,
    notes?: string | null,
    reportId?: string // Optional link
}) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    try {
        await prisma.confiscation.create({
            data: {
                citizenName: data.citizenName || null,
                drugType: data.drugType,
                quantity: data.quantity,
                // unit field is ignored/removed, handled by frontend conversion now
                notes: data.notes,
                officerId: user.id,
                reportId: data.reportId || null
            }
        })

        revalidatePath("/dashboard/confiscations")
        if (data.reportId) revalidatePath(`/dashboard/reports/${data.reportId}/edit`) // Hypothetical path

        return { success: true }
    } catch (error) {
        console.error("Create Confiscation Error:", error)
        return { success: false, error: "Failed to create log" }
    }
}

export async function deleteConfiscation(id: string) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Check permissions (Admin or Author?)
    // For now strict admin/mod or author
    const target = await prisma.confiscation.findUnique({ where: { id } })
    if (!target) return { success: false, error: "Not found" }

    if (user.rank?.systemRole !== 'ADMIN' && user.rank?.systemRole !== 'ROOT' && target.officerId !== user.id) {
        return { success: false, error: "Insufficient permissions" }
    }

    try {
        await prisma.confiscation.delete({ where: { id } })
        revalidatePath("/dashboard/confiscations")
        return { success: true }
    } catch (error) {
        console.error("Delete Error:", error)
        return { success: false, error: "Delete failed" }
    }
}

export async function getSeizureStats() {
    const user = await getServerUser()
    if (!user) return { total: 0, user: 0 }

    try {
        const totalAgg = await prisma.confiscation.aggregate({
            _sum: { quantity: true }
        })

        const userAgg = await prisma.confiscation.aggregate({
            where: { officerId: user.id },
            _sum: { quantity: true }
        })

        // Convert grams to kg
        const totalKg = (totalAgg._sum.quantity || 0) / 1000
        const userKg = (userAgg._sum.quantity || 0) / 1000

        return { total: totalKg, user: userKg }
    } catch (error) {
        console.error("Stats Error:", error)
        return { total: 0, user: 0 }
    }
}
