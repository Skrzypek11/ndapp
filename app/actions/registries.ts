"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerUser } from "@/lib/auth"

export async function getDrugTypes() {
    try {
        const types = await prisma.drugType.findMany({
            orderBy: { name: 'asc' }
        })
        return types
    } catch (error) {
        console.error("Fetch Drug Types Error:", error)
        return []
    }
}

export async function createDrugType(name: string) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
    if (!isAdmin) return { success: false, error: "Administrative privileges required" }

    try {
        await prisma.drugType.create({
            data: { name }
        })
        revalidatePath("/dashboard/admin/registries/drugs")
        revalidatePath("/dashboard/confiscations/create") // Refresh list on create form
        return { success: true }
    } catch (error) {
        console.error("Create Drug Type Error:", error)
        return { success: false, error: "Failed to create drug type" }
    }
}

export async function deleteDrugType(id: string) {
    const user = await getServerUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT'
    if (!isAdmin) return { success: false, error: "Administrative privileges required" }

    try {
        await prisma.drugType.delete({ where: { id } })
        revalidatePath("/dashboard/admin/registries/drugs")
        revalidatePath("/dashboard/confiscations/create")
        return { success: true }
    } catch (error) {
        console.error("Delete Drug Type Error:", error)
        return { success: false, error: "Failed to delete drug type" }
    }
}
