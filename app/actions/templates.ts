"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const TemplateSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    content: z.string().min(1),
    type: z.enum(["REPORT", "CASE", "KOMPENDIUM"]),
})

export async function getTemplates(type?: "REPORT" | "CASE" | "KOMPENDIUM") {
    try {
        const templates = await prisma.template.findMany({
            where: type ? { type } : undefined,
            orderBy: { name: 'asc' }
        })
        return templates
    } catch (error) {
        console.error("Failed to fetch templates:", error)
        return []
    }
}

export async function createTemplate(data: z.infer<typeof TemplateSchema>) {
    try {
        const valid = TemplateSchema.parse(data)
        await prisma.template.create({
            data: valid
        })
        revalidatePath("/dashboard/admin")
        return { success: true }
    } catch (error) {
        console.error("Failed to create template:", error)
        return { success: false, error: "Failed to create template" }
    }
}

export async function updateTemplate(id: string, data: Partial<z.infer<typeof TemplateSchema>>) {
    try {
        await prisma.template.update({
            where: { id },
            data
        })
        revalidatePath("/dashboard/admin")
        return { success: true }
    } catch (error) {
        console.error("Failed to update template:", error)
        return { success: false, error: "Failed to update template" }
    }
}

export async function deleteTemplate(id: string) {
    try {
        await prisma.template.delete({
            where: { id }
        })
        revalidatePath("/dashboard/admin")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete template:", error)
        return { success: false, error: "Failed to delete template" }
    }
}
