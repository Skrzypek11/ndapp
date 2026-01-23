"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerUser } from "@/lib/auth";

export async function getAnnouncements() {
    const user = await getServerUser();
    if (!user) return [];

    try {
        const announcements = await prisma.announcement.findMany({
            include: {
                author: {
                    include: { rank: true }
                },
                readBy: {
                    where: { userId: user.id }
                },
                _count: {
                    select: { readBy: true }
                }
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return announcements.map(a => ({
            ...a,
            isRead: a.readBy.length > 0
        }));
    } catch (error) {
        console.error("Failed to fetch announcements:", error);
        return [];
    }
}

export async function createAnnouncement(data: {
    title: string;
    body: string;
    priority: string;
    isPinned: boolean;
}) {
    const user = await getServerUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT';
    if (!isAdmin) return { success: false, error: "Administrative privileges required" };

    try {
        const announcement = await prisma.announcement.create({
            data: {
                title: data.title,
                body: data.body,
                priority: data.priority,
                isPinned: data.isPinned,
                authorId: user.id
            }
        });
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/announcements");
        return { success: true, data: announcement };
    } catch (error) {
        console.error("Failed to create announcement:", error);
        return { success: false, error: "Database error" };
    }
}

export async function markAsRead(announcementId: string) {
    const user = await getServerUser();
    if (!user) return { success: false, error: "Unauthorized" };

    try {
        await prisma.announcementRead.upsert({
            where: {
                announcementId_userId: {
                    announcementId,
                    userId: user.id
                }
            },
            update: {},
            create: {
                announcementId,
                userId: user.id
            }
        });
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/announcements");
        return { success: true };
    } catch (error) {
        console.error("Failed to mark announcement as read:", error);
        return { success: false, error: "Database error" };
    }
}

export async function getReadReceipts(announcementId: string) {
    const user = await getServerUser();
    if (!user) return [];

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT';
    if (!isAdmin) return []; // Only admins can see who read what

    try {
        const receipts = await prisma.announcementRead.findMany({
            where: { announcementId },
            include: {
                user: {
                    include: { rank: true }
                }
            },
            orderBy: {
                readAt: 'desc'
            }
        });
        return receipts;
    } catch (error) {
        console.error("Failed to fetch read receipts:", error);
        return [];
    }
}

export async function getUnreadCount() {
    const user = await getServerUser();
    if (!user) return 0;

    try {
        const total = await prisma.announcement.count();
        const read = await prisma.announcementRead.count({
            where: { userId: user.id }
        });
        return total - read;
    } catch (error) {
        console.error("Failed to fetch unread count:", error);
        return 0;
    }
}

export async function deleteAnnouncement(id: string) {
    const user = await getServerUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const isAdmin = user.rank?.systemRole === 'ADMIN' || user.rank?.systemRole === 'ROOT';
    if (!isAdmin) return { success: false, error: "Administrative privileges required" };

    try {
        await prisma.announcement.delete({
            where: { id }
        });
        revalidatePath("/dashboard");
        revalidatePath("/dashboard/announcements");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete announcement:", error);
        return { success: false, error: "Database error" };
    }
}
