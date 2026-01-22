"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerUser } from "@/lib/auth"

export async function createUser(formData: FormData) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
    if (!isAdmin) return { success: false, error: "Administrative privileges required" }

    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const rpName = formData.get("rpName") as string
    const badgeNumber = formData.get("badgeNumber") as string
    const rankId = formData.get("rankId") as string
    const phoneNumber = formData.get("phoneNumber") as string

    if (!email || !password || !rpName || !rankId) {
        return { success: false, error: "Missing required fields" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    try {
        await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                rpName,
                badgeNumber,
                rankId,
                phoneNumber,
                avatarUrl: `https://ui-avatars.com/api/?name=${rpName}&background=0D8ABC&color=fff`
            }
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (e) {
        console.error("Create User Error:", e)
        return { success: false, error: "Failed to create user. Email or Badge might be duplicate." }
    }
}

export async function getUsers(): Promise<any[]> {
    const user = await getServerUser()
    if (!user) return []

    return prisma.user.findMany({
        include: { rank: true },
        orderBy: { rank: { order: 'desc' } }
    })
}

export async function getRanks() {
    const user = await getServerUser()
    if (!user) return []

    return prisma.rank.findMany({
        orderBy: { order: 'desc' }
    })
}

export async function getOfficerProfile(userId: string) {
    const sessionUser = await getServerUser()
    if (!sessionUser) return null

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { rank: true }
        })

        if (!user) return null

        // Get stats using Prisma Client instead of raw SQL
        const [reportsAuthored, reportsCoAuthored, activeCases, closedCases] = await Promise.all([
            prisma.report.count({ where: { authorId: userId } }),
            prisma.report.count({ where: { coAuthors: { some: { id: userId } } } }),
            prisma.caseModel.count({ where: { leadInvestigatorId: userId, status: { not: 'CLOSED' } } }),
            prisma.caseModel.count({ where: { leadInvestigatorId: userId, status: 'CLOSED' } }),
        ])

        return {
            ...user,
            stats: {
                reportsAuthored,
                reportsCoAuthored,
                activeCases,
                closedCases,
            }
        }
    } catch (error) {
        console.error("Fetch Profile Error:", error)
        return null
    }
}

export async function updateOfficerProfile(userId: string, data: any) {
    const sessionUser = await getServerUser()
    if (!sessionUser) return { success: false, error: "Unauthorized" }

    const isAdmin = sessionUser.rank?.systemRole === 'ADMIN' || sessionUser.rank?.systemRole === 'ROOT'
    const isSelf = sessionUser.id === userId

    if (!isAdmin && !isSelf) {
        return { success: false, error: "Unauthorized modification attempt" }
    }

    try {
        // If not admin, restrict which fields can be updated
        const updateData: any = isAdmin ? {
            firstName: data.firstName,
            lastName: data.lastName,
            rpName: `${data.firstName || ''} ${data.lastName || ''}`.trim() || undefined,
            badgeNumber: data.badgeNumber,
            rankId: data.rankId,
            phoneNumber: data.phoneNumber,
            email: data.email,
            status: data.status,
            unitAssignment: data.unitAssignment,
            notes: data.notes,
            avatarUrl: data.avatarUrl,
        } : {
            // Limited fields for self-update (e.g., avatar, phone, unit assignment can be restricted too based on policy)
            phoneNumber: data.phoneNumber,
            avatarUrl: data.avatarUrl,
        }

        await prisma.user.update({
            where: { id: userId },
            data: updateData
        })
        revalidatePath("/")
        revalidatePath("/dashboard/roster")
        return { success: true }
    } catch (e) {
        console.error("Update Profile Error:", e)
        return { success: false, error: "Failed to update profile." }
    }
}
