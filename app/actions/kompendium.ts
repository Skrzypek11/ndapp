"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerUser } from "@/lib/auth";

export async function getCompendiumDocs(category?: string) {
    const user = await getServerUser();
    if (!user) return [];

    try {
        const docs = await prisma.compendiumDoc.findMany({
            where: category ? {
                category: {
                    startsWith: category
                }
            } : undefined,
            include: {
                author: {
                    include: { rank: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return docs;
    } catch (error) {
        console.error("Failed to fetch compendium docs:", error);
        return [];
    }
}

export async function createCompendiumDoc(data: {
    title: string;
    body: string;
    category: string;
    tags?: string;
}) {
    const user = await getServerUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT';
    if (!isAdmin) return { success: false, error: "Administrative privileges required" };

    try {
        const doc = await prisma.compendiumDoc.create({
            data: {
                title: data.title,
                body: data.body,
                category: data.category,
                tags: data.tags,
                authorId: user.id
            }
        });
        revalidatePath("/dashboard/kompendium");
        return { success: true, data: doc };
    } catch (error) {
        console.error("Failed to create compendium doc:", error);
        return { success: false, error: "Database error" };
    }
}

export async function getCompendiumDoc(id: string) {
    const user = await getServerUser();
    if (!user) return null;

    try {
        const doc = await prisma.compendiumDoc.findUnique({
            where: { id },
            include: {
                author: {
                    include: { rank: true }
                }
            }
        });
        return doc;
    } catch (error) {
        console.error("Failed to fetch compendium doc:", error);
        return null;
    }
}

export async function getCategories() {
    const user = await getServerUser();
    if (!user) return [];

    try {
        const docs = await prisma.compendiumDoc.findMany({
            select: {
                category: true
            },
            distinct: ['category']
        });
        return docs.map(d => d.category);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return [];
    }
}

export async function updateCompendiumDoc(id: string, updates: any) {
    const user = await getServerUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT';
    if (!isAdmin) return { success: false, error: "Administrative privileges required" };

    try {
        await prisma.compendiumDoc.update({
            where: { id },
            data: updates
        });
        revalidatePath("/dashboard/kompendium");
        return { success: true };
    } catch (error) {
        console.error("Update Compendium Doc Error:", error);
        return { success: false, error: "Database error" };
    }
}

export async function deleteCompendiumDoc(id: string) {
    const user = await getServerUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT';
    if (!isAdmin) return { success: false, error: "Administrative privileges required" };

    try {
        await prisma.compendiumDoc.delete({
            where: { id }
        });
        revalidatePath("/dashboard/kompendium");
        return { success: true };
    } catch (error) {
        console.error("Delete Compendium Doc Error:", error);
        return { success: false, error: "Database error" };
    }
}
